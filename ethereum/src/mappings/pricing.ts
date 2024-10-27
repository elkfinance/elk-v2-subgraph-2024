/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDT_WETH_PAIR = '0xfa2048b1008039ca629747353791baef47e25456'
const USDC_WETH_PAIR = '0x447a8103596af3ad1ed8dcdff53b1dd599264cd6'
const DAI_WETH_PAIR = '0xe92cc0e5db597066b3c26016b2fb32830401a31a'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token0
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price.times(daiWeight)
      .plus(usdcPair.token0Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price
  }  else if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return BigDecimal.fromString('2800')
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH

  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
  '0xff20817765cb7f73d4bde2e66e067e58d11095c2', // AMP
  '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
  '0x0d8775f648430679a709e98d2b0cb6250d2887ef', // BAT
  '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c', // BNT
  '0xc00e94cb662c3520282e6f5717214004a7f26888', // COMP
  '0xd533a949740bb3306d119cc777fa900ba034cd52', // CRV
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c', // ENJ
  '0xc944e90c64b2c07662a292be6244bdf05cda44a7', // GRT
  '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd', // GUSD
  '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
  '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd', // LRC
  '0x0f5d2fb29fb7d3cfee444a200298f468908cc942', // MANA
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
  '0x4575f41308ec1483f3d399aa9a2826d74da13deb', // OXT
  '0x45804880de22913dafe09f4980848ece6ecbaf78', // PAXG
  '0x408e41876cccdc0f92210600ef50372656052a38', // REN
  '0x3845badade8e6dff049820680d1f14bd3903a5d0', // SAND
  '0x00c83aecc790e8a4453e5dd3b0b4b3680501a7a7', // SKL
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
  '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac', // STORJ
  '0x04fa0d235c4abf4bcf4787af4cf447de572ef828', // UMA
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', // YFI
  '0xe41d2489571d322189246dafa5ebde1f4699f498', // ZRX
  '0xa283aa7cfbb27ef0cfbcb2493dd9f4330e0fd304', // MM
  '0xb753428af26e81097e7fd17f40c88aaa3e04902c', // SFI
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x7a5d3a9dcd33cb8d527f7b5f96eb4fef43d55636', // RADIO
  '0x491604c0fdf08347dd1fa4ee062a822a5dd06b5d', // CTSI
  '0x8d6cebd76f18e1558d4db88138e2defb3909fad6', // MAI
  '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8', // agEUR
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32', // LDO
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // WstETH
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', // stETH
  '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202', // KNC
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
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
