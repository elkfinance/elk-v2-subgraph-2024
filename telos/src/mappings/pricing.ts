/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0xd102ce6a4db07d247fcc28f366a623df0938ca9e' // WTLOS
const USDT_WETH_PAIR = '0xc395fb127103e4d0a85f375a6b0f724fc99abccc' // USDT-WTLOS (USDT is token0)

export function getEthPriceInUSD(): BigDecimal {
  // Load the USDT-WTLOS pair, where USDT is token0 and WTLOS is token1
  let usdtPair = Pair.load(USDT_WETH_PAIR) // USDT is token0, WTLOS is token1

  if (usdtPair !== null) {
    // token1Price is the price of WTLOS in terms of USDT, where USDT is assumed to be $1
    return usdtPair.token1Price // Return WTLOS price in USD (token1Price is WTLOS's price in USDT)
  } else {
    return ONE_BD // fallback if pair not found, though this should rarely happen
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WTLOS
  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // elk
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // old_elk
  '0xe1c8f3d529bea8e3fa1fac5b416335a2f998ee1c', // elk_legacy
  '0x8d97cea50351fb4329d591682b148d43a0c3611b', // USDC
]

// minimum liquidity required to count towards tracked volume for pairs with small # of LPs
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

/**
 * Search through graph to find derived WTLOS per token.
 * @todo update to be derived WTLOS (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  // If the token is WTLOS, return the derived price in USD (using the WTLOS-USDT pair)
  if (token.id == WETH_ADDRESS) {
    return getEthPriceInUSD() // WTLOS price should be derived from USDT
  }

  // Loop through the whitelist to find pairings and derive the price
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair === null) {
        continue
      }

      // token0 is the queried token
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        if (token1 === null) {
          continue
        }
        return pair.token0Price.times(token1.derivedETH as BigDecimal) // price of token0 * Eth per token1
      }

      // token1 is the queried token
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        if (token0 === null) {
          continue
        }
        return pair.token1Price.times(token0.derivedETH as BigDecimal) // price of token1 * Eth per token0
      }
    }
  }
  return ZERO_BD // fallback in case no pair is found
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair,
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice) // derived price for token0 in ETH
  let price1 = token1.derivedETH.times(bundle.ethPrice) // derived price for token1 in ETH

  // don't count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD
  }

  // Calculate reserve values in USD
  let reserve0USD = pair.reserve0.times(price0)
  let reserve1USD = pair.reserve1.times(price1)

  // Check if both tokens are whitelisted, and if so, average their USD values
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // Handle the case where only token0 is whitelisted
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // Handle the case where only token1 is whitelisted
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // Neither token is whitelisted, return 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
