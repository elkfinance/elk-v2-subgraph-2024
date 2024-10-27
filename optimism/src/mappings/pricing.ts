/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDT_WETH_PAIR = '0x3d2ea0c20cd11dc2845faa20498e48e90b94b543'
const USDC_WETH_PAIR = '0x066ff66561f7670ce6ff5bbf40396ccc69b9e872'
const DAI_WETH_PAIR = '0x44f297a1aa2618f79ed1195b30cfbc3c209d1b49'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token1
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve0).plus(usdtPair.reserve0)
    let daieWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdceWeight = usdcPair.reserve0.div(totalLiquidityETH)
    let usdteWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price.times(daieWeight)
        .plus(usdcPair.token1Price.times(usdceWeight))
        .plus(usdtPair.token1Price.times(usdteWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve0)
    let daieWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdceWeight = usdcPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price.times(daieWeight).plus(usdcPair.token1Price.times(usdceWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token1Price
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
  '0x4200000000000000000000000000000000000006', // WETH
  '0x8700daec35af8ff88c16bdf0418774cb3d7599b4', // SNX
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
  '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
  '0x68f180fcce6836688e9084f035309e29bf0a2095', // WBTC
  '0xe0bb0d3de8c10976511e5030ca403dbf4c25165b', // 0xBTC
  '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // LINK
  '0x65559aa14915a70190438ef90104769e5e890a00', // ENS
  '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9', // sUSD
  '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC.e
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC
  '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49', // sETH
  '0x298b9b95708152ff6968aafd889c6586e9169f1d', // sBTC
  '0xc5db22719a06418028a40a9b5e9a7c02959d0d08', // sLINK
  '0x6fd9d7ad17242c41f7131d257212c54a0e816691', // UNI
  '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819', // LUSD
  '0xb548f63d4405466b36c0c0ac3318a22fdcec711a', // RGT
  '0x7fb688ccf682d58f86d7e38e03f9d22e7705448b', // RAI
  '0x9bcef72be871e61ed4fbbc7630889bee758eb81d', // rETH
  '0x00f932f0fe257456b32deda4758922e56a4f4b42', // PAPER
  '0x7c6b91d9be155a6db01f749217d76ff02a7227f2', // SARCO
  '0x5029c236320b8f15ef0a657054b84d90bfbeded3', // BitANT
  '0xc98b98d17435aa00830c87ea02474c5007e1f272', // BitBTC
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // LYRA
  '0xe7798f023fc62146e8aa1b36da45fb70855a77ea', // UMA
  '0x9e1028f5f1d5ede59748ffcee5532509976840e0', // PERP
  '0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3', // DF
  '0xbfd291da8a403daaf7e5e9dc1ec0aceacd4848b9', // USX
  '0x3e7ef8f50246f725885102e8238cbba33f276747', // BOND
  '0x7b0bcc23851bbf7601efc9e9fe532bf5284f65d3', // EST
  '0x1da650c3b2daa8aa9ff6f661d4156ce24d08a062', // DCN
  '0xf98dcd95217e15e05d8638da4c91125e59590b07', // KROM
  '0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151', // DHT
  '0x3bb4445d30ac020a84c1b5a8a2c6248ebc9779d0', // LIZ
  '0x3390108e913824b8ead638444cc52b9abdf63798', // MASK
  '0x0994206dfe8de6ec6920ff4d779b0d950605fb53', // CRV
  '0xcfd1d50ce23c46d3cf6407487b2f8934e96dc8f9', // SPANK
  '0xfeaa9194f9f8c1b65429e31341a103071464907e', // LRC
  '0x217d47011b23bb961eb6d93ca9945b7501a5bb11', // THALES
  '0xba28feb4b6a6b81e3f26f08b83a19e715c4294fd', // UST
  '0xe4f27b04cc7729901876b44f4eaa5102ec150265', // XCHF
  '0x76fb31fb4af56892a25e32cfc43de717950c9278', // AAVE
  '0x81ab7e0d570b01411fcc4afd3d50ec8c241cb74b', // EQZ
  '0xdfa46478f9e5ea86d57387849598dbfb2e964b02', // MAI
  '0x9485aca5bbbe1667ad97c7fe7c4531a624c8b1ed', // agEUR
  '0xa00e3a3511aac35ca78530c85007afcd31753819', // KNC
  '0x4200000000000000000000000000000000000042', // OP
  '0xaed882f117b78034829e2cffa11206706837b1b1', // WQ
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
