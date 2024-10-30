/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15'
const STABLE1_WETH_PAIR = '0xbd0fc5a13e65065efe2525420a147c91ad59a229' //USDT is token 0
const STABLE2_WETH_PAIR = '0x33effee6e54929fa03770fb5c6708c60c3408c8d' // USDC is token 1
const STABLE3_WETH_PAIR = '0xc81f2313fb7544a252d667173a9f5a30593c24d4' //BUSD is token 0

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let stable3Pair = Pair.load(STABLE3_WETH_PAIR) // stable3 is token0
  let stable2Pair = Pair.load(STABLE2_WETH_PAIR) // stable2 is token1
  let stable1Pair = Pair.load(STABLE1_WETH_PAIR) // stable1 is token0

  // all 3 have been created
  if (stable3Pair !== null && stable2Pair !== null && stable1Pair !== null) {
    let totalLiquidityETH = stable3Pair.reserve1.plus(stable2Pair.reserve1).plus(stable1Pair.reserve1)
    let stable3Weight = stable3Pair.reserve1.div(totalLiquidityETH)
    let stable2Weight = stable2Pair.reserve0.div(totalLiquidityETH)
    let stable1Weight = stable1Pair.reserve1.div(totalLiquidityETH)
    return stable3Pair.token0Price.times(stable3Weight)
      .plus(stable2Pair.token1Price.times(stable2Weight))
      .plus(stable1Pair.token0Price.times(stable1Weight))
    // stable3 and STABLE2 have been created
  } else if (stable3Pair !== null && stable2Pair !== null) {
    let totalLiquidityETH = stable3Pair.reserve1.plus(stable2Pair.reserve0)
    let stable3Weight = stable3Pair.reserve1.div(totalLiquidityETH)
    let stable2Weight = stable2Pair.reserve0.div(totalLiquidityETH)
    return stable3Pair.token0Price.times(stable3Weight).plus(stable2Pair.token1Price.times(stable2Weight))
    // STABLE2 is the only pair so far
  } else if (stable2Pair !== null) {
    return stable2Pair.token1Price
  }  else if (stable1Pair !== null) {
    return stable1Pair.token0Price
  } else {
    return ONE_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH
  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0x8eac9d49f71a9393ed38a619038e880c86d5745c', // PND
  '0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2', // OKB
  '0x54e4622dc504176b3bb432dccaf504569699a7ff', // BTCK
  '0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c', // ETHK
  '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15', // WOKT
  '0x382bb369d343125bfb2117af9c149795c6c65c50', // USDT
  '0xdcac52e001f5bd413aa6ea83956438f29098166b', // USDK
  '0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85', // USDC
  '0xabc732f6f69a519f6d508434481376b6221eb7d5', // DOTK
  '0x3f8969be2fc0770dcc174968e4b4ff146e0acdaf', // FILK
  '0xfa520efc34c81bfc1e3dd48b7fe9ff326049f986', // LTCK
  '0x18d103b7066aeedb6005b78a462ef9027329b1ea', // BCHK
  '0x00505505a7576d6734704fabb16f41924e3e384b', // TRXK
  '0xaa27badaa3c9ec9081b8f6c9cdd2bf375f143780', // SHIBK
  '0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0', // WBNB
  '0x79b627bc95fa5b36eca53eb39c3cdf43aafdd10f', // ORG
  '0x332730a4f6e03d9c55829435f10360e13cfa41ff', // BUSD
  '0x97513e975a7fa9072c72c92d8000b0db90b163c5', // BabyDoge
  '0xc3bdfee6186849d5509601045af4af567a001c94', // Glory
  '0x6b7a87899490ece95443e979ca9485cbe7e71522', // HERO
  '0x748def2e7fbb37111761aa78260b0ce71e41d4ca', // COCO
  '0x03d1e72765545729a035e909edd9371a405f77fb', // nHUSD
  '0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0', // ELE
  '0x02f093513b7872cdfc518e51ed67f88f0e469592', // OKFly
  '0x5ab622494ab7c5e81911558c9552dbd517f403fb', // CELT
  '0xa07403c1bd0c5cf53df07f15faa589241352527b', // BLADE
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
