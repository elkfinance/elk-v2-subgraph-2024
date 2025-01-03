/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

// ALWAYS IN LOWER CASE!!
const WETH_ADDRESS = '0x0be9e53fd7edac9f859882afdda116645287c629'
const USDC_WETH_PAIR = '0x602352a9eb5234466eac23e59e7b99bcae79c39c'
const USDT_WETH_PAIR = '0xeb25d5edba178475fce4256c03496aa70fdc3688'
const FUSD_WETH_PAIR = '0x980fa8466eb6a93e8afcc692773c6e71a8cdc053'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token1
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1
  let fusdPair = Pair.load(FUSD_WETH_PAIR) // fusd is token1
  
  // all 3 have been created
  if (fusdPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = fusdPair.reserve0.plus(usdcPair.reserve0).plus(usdtPair.reserve0)
    let fusdWeight = fusdPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return fusdPair.token1Price
        .times(fusdWeight)
        .plus(usdcPair.token1Price.times(usdcWeight))
        .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (fusdPair !== null && usdcPair !== null) {
    let totalLiquidityETH = fusdPair.reserve0.plus(usdcPair.reserve0)
    let fusdWeight = fusdPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityETH)
    return fusdPair.token1Price.times(fusdWeight).plus(usdcPair.token1Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token1Price
  } else {
    return ONE_BD.times(BigDecimal.fromString('0.3'))
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH

  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0x6acb34b1df86e254b544189ec32cf737e2482058', // WBNB
  '0x94ba7a27c7a95863d1bdc7645ac2951e0cca06ba', // DAI
  '0x2f60a843302f1be3fa87429ca9d684f9091b003c', // DEXT
  '0xce86a1cf3cff48139598de6bf9b1df2e0f79f86f', // fUSDv3
  '0x495d133b938596c9984d462f007b676bdc57ecec', // G$
  '0x025a4c577198d116ea499193e6d735fdb2e6e841', // GRT
  '0x43b17749b246fd2a96de25d9e4184e27e09765b0', // KNC
  '0x0972f26e8943679b043de23df2fd3852177a7c48', // WLINK
  '0x7f59ae3a787c0d1d640f99883d0e48c22188c54f', // OM
  '0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5', // USDC
  '0xfadbbf8ce7d5b7041be672561bba99f79c532e10', // USDT
  '0x33284f95ccb7b948d9d352e1439561cf83d8d00d', // WBTC
  '0xa722c13135930332eb3d749b2f0906559d2c5b99', // WETH
  '0x0be9e53fd7edac9f859882afdda116645287c629', // WFUSE
  '0xebb82851b8e1348cc774442735b710b4cd105210', // fDoge
  '0x90708b20ccc1eb95a4fa7c8b18fd2c22a0ff9e78', // SUSHI
  '0x7ec73806f81b4044d64416468c4b05688f38e365', // DELTA
  '0xfe4d5e383beaa6d2357ce7ba9883019b760ad134', // tGod
  '0x427c995a0623157a3c1c6b8b86410b5b3a26061b', // GRIM
  '0x42e44f16d2183d7ed27c501b04f29084ef4c2d24', // ISWT
  '0x4e69ae0cd024754655b4ef74f24a8dcb39ba07e8', // CEUS
  '0x2dfdab3253051f6857580d9a360c531cbf40eb4d', // DMK
  '0x6d2a05948ed279f8a0ca532fc1a2a7767300c46e', // DC
  '0x74616164eb1892cec5fa553d45b3e5d6df7bc7b9', // FOO
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair === null) {
        continue
      }
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        if (token1 === null) {
          continue
        }
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        if (token0 === null) {
          continue
        }
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
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
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // dont count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD
  }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
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
