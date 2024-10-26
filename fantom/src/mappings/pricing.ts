/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const USDT_WETH_PAIR = '0xe42127409a82817ba4d75eef294670e1b4ed8e6d'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return ONE_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH

  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0xe1c8f3d529bea8e3fa1fac5b416335a2f998ee1c', // lELK
  '0x5cc61a78f164885776aa610fb0fe1257df78e59b', // SPIRIT
  '0xf1648c50d2863f780c57849d812b4b7686031a3d', // lzWBTC
  '0x9ba3e4f84a34df4e08c112e1a0ff148b81655615', // SHIBA
  '0xe91d855e870bb6462ef8876d9ab9c130968b1131', // DSTEIN
  '0x695921034f0387eac4e11620ee91b1b15a6a09fe', // lzWETH
  '0xb01e8419d842beebf1b70a7b5f7142abbaf7159d', // COVER
  '0x657a1861c15a3ded9af0b6799a195a249ebdcbc6', // CREAM
  '0x1e4f97b9f9f913c46f1632781732927b9019c68b', // CRV
  '0x924828a9fb17d47d0eb64b57271d10706699ff11', // SFI
  '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc', // WSUSHI
  '0x56ee926bd8c72b2d5fa1af4d9e4cbb515a1e3adc', // SNX
  '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8', // WLINK
  '0x29b0da86e484e1c0029b56e817912d778ac0ec69', // YFI
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
  '0x69c744d3444202d35a2783929a0f930f2fbb05ad', // SFTM
  '0x09e145a1d53c0045f41aeef25d8ff982ae74dd56', // ZOO
  '0xf16e81dce15b08f326220742020379b855b87df9', // ICE
  '0xaf319e5789945197e365e7f7fbfc56b130523b33', // FRAX
  '0xbac5d43a56696e5d0cb631609e85798f564b513b', // BITB
  '0x82f8cb20c14f134fe6ebf7ac3b903b2117aafa62', // FXS
  '0xddcb3ffd12750b45d32e084887fdf1aabab34239', // ANY
  '0x907f1a48918bb5de07c12443cab0e6eefcc611bc', // CZTEARS
  '0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b', // AAVE
  '0x753fbc5800a8c8e3fb6dc6415810d627a387dfc9', // BADGER
  '0x46e7628e8b4350b2716ab470ee0ba1fa9e76c6c5', // BAND
  '0x841fad6eae12c286d1fd18d1d525dffa75c7effe', // BOO
  '0x08f6fe8f4dc577cf81e40e03e561d29b8b33e19b', // DIGG
  '0xbfaf328fe059c53d936876141f38089df0d1503d', // MM
  '0xd0660cd418a64a1d44e9214ad8e459324d8157f1', // WOOFY
  '0xf43cc235e686d7bc513f53fbffb61f760c3a1882', // ELITE
  '0xae0c241ec740309c2cbdc27456eb3c1a2ad74737', // WILD
  '0xa9937092c4e2b0277c16802cc8778d252854688a', // FOLIVE
  '0xfb98b335551a418cd0737375a2ea0ded62ea213b', // MAI
  '0x53d831e1db0947c74e8a52618f662209ec5de0ce', // SING
  '0x68aa691a8819b07988b18923f712f3f4c8d36346', // QiDAO
  '0x28a92dde19d9989f39a49905d7c9c2fac7799bdf', // lzUSDC
  '0x1b6382dbdea11d97f24495c9a90b7c88469134a4', // axlUSDC
  '0xd226392c23fb3476274ed6759d4a478db3197d82', // axlUSDT
  '0xcc1b99ddac1a33c201a742a1851662e87bc7f22c', // lzUSDT
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
