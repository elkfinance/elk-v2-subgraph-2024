/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'
import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0x8d193c6efa90bcff940a98785d1ce9d093d3dc8a'
const STABLE1_WETH_PAIR = '0x0bed975de28c4409bce3c60b22c1ede9b7f8e61f'
const STABLE2_WETH_PAIR = '0x4eaf45d6bfd68fef85150ffe3e409b431cfb29ba'
const STABLE3_WETH_PAIR = '0x45628b2692ae4ed1c486addf30d7683888de9280'
const STABLE4_WETH_PAIR = '0x4626f389143465238d0f3ee2edf08e5a6c6d2865'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let stable1Pair = Pair.load(STABLE1_WETH_PAIR) // USDC_t is token1
  let stable2Pair = Pair.load(STABLE2_WETH_PAIR) // USDD_t is token0  
  let stable3Pair = Pair.load(STABLE3_WETH_PAIR) // USDT_t is token1
  let stable4Pair = Pair.load(STABLE4_WETH_PAIR) // USDT_b is token1

  // all 3 have been created
  if (stable3Pair !== null && stable2Pair !== null && stable4Pair !== null) {
    let totalLiquidityETH = stable3Pair.reserve0.plus(stable2Pair.reserve1).plus(stable4Pair.reserve0)
    let stable3Weight = stable3Pair.reserve0.div(totalLiquidityETH)
    let stable2Weight = stable2Pair.reserve1.div(totalLiquidityETH)
    let stable4Weight = stable4Pair.reserve0.div(totalLiquidityETH)
    return stable3Pair.token1Price.times(stable3Weight)
      .plus(stable2Pair.token0Price.times(stable2Weight))
      .plus(stable4Pair.token1Price.times(stable4Weight))
    // dai and USDC have been created
  } else if (stable3Pair !== null && stable2Pair !== null) {
    let totalLiquidityETH = stable3Pair.reserve0.plus(stable2Pair.reserve1)
    let stable3Weight = stable3Pair.reserve0.div(totalLiquidityETH)
    let stable2Weight = stable2Pair.reserve1.div(totalLiquidityETH)
    return stable3Pair.token1Price.times(stable3Weight).plus(stable2Pair.token0Price.times(stable2Weight))
    // USDC is the only pair so far
  } else if (stable2Pair !== null) {
    return stable2Pair.token0Price
  }  else if (stable1Pair !== null) {
    return stable1Pair.token1Price
  } else {
    return ONE_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WBTT
  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xcbb9edf6775e39748ea6483a7fa6a385cd7e9a4e', // BTT_b
  '0x65676055e58b02e61272cedec6e5c6d56badfb86', // BTT_e
  '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d', // USDT_b
  '0xdb28719f7f938507dbfe4f0eae55668903d34a15', // USDT_t
  '0xedf53026aea60f8f75fca25f8830b7e2d6200662', // TRX
  '0x185a4091027e2db459a2433f85f894dc3013aeb5', // BNB
  '0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006', // wETH
  '0xa20dfb01dca223c0e52b0d4991d4afa7e08e3a50', // ETH_b
  '0xca424b845497f7204d9301bd13ff87c0e2e86fcf', // USDC_b
  '0x935faa2fcec6ab81265b301a30467bbc804b43d3', // USDC_t
  '0xae17940943ba9440540940db0f1877f101d39e8b', // USDC_e
  '0x17f235fd5974318e4e2a5e37919a209f7c37a6d1', // USDD_t
  '0x74e7cef747db9c8752874321ba8b26119ef70c9e', // USDD_b
  '0xb602f26bf29b83e4e1595244000e0111a9d39f62', // USDD_e
  '0x17501034df227d8565a8c11f41df2418f5d403b6', // JST_t
  '0x76accfb75b8bb7c6c295f04d19c1d184d274c853', // SUN_t
  '0xde47772ac041a4ccf3c865632131d1093e51c02d', // BUSD_b
  '0x1a7019909b10cdd2d8b0034293ad729f1c1f604e', // BTC_b
  '0x9888221fe6b5a2ad4ce7266c7826d2ad74d40ccf', // WBTC_e
  '0xe7dc549ae8db61bde71f22097becc8db542ca100', // DAI_e
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
