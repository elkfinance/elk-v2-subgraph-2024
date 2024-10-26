/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

// ALWAYS IN LOWER CASE!!
const WETH_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
const DAI_WETH_PAIR = '0xd911c52c6724ad980c9a5229082af2322d812f77'
const USDC_WETH_PAIR = '0xbcc871ad1ce206b0a228c133c3fed98a7bc8c4da'
const USDT_WETH_PAIR = '0x827ab2cbafdb21bb5f475e19d0c0e2197e693cdf'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token1
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token1
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve0).plus(usdtPair.reserve0)
    let daiWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price
      .times(daiWeight)
      .plus(usdcPair.token1Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve0.plus(usdcPair.reserve0)
    let daiWeight = daiPair.reserve0.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityETH)
    return daiPair.token1Price.times(daiWeight).plus(usdcPair.token1Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token1Price
  } else {
    return ONE_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  // ALWAYS IN LOWER CASE!!
  WETH_ADDRESS, // WMATIC
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // elk
  '0xe1c8f3d529bea8e3fa1fac5b416335a2f998ee1c', // elk_legacy
  '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7', // ghst
  '0x05089c9ebffa4f0aca269e32056b1b36b37ed71b', // krill
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // dai
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // eth
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // usdc
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // usdt
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // wbtc
  '0xf239e69ce434c7fb408b05a0da416b14917d934e', // shi3ld
  '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // link
  '0xd6df932a45c0f255f85145f286ea0b292b21c90b', // aave
  '0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f', // must
  '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a', // sushi
  '0xf2ae0038696774d65e67892c9d301c5f2cbbda58', // cxo
  '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4', // mana
  '0x831753dd7087cac61ab5644b308642cc1c33dc13', // quick
  '0xb8ab048d6744a276b2772dc81e406a4b769a5c3d', // wusd
  '0x4c4bf319237d98a30a929a96112effa8da3510eb', // wexpoly
  '0x3053ad3b31600074e9a90440770f78d5e8fc5a54', // waultx
  '0x37d1ebc3af809b8fadb45dce7077efc629b2b5bb', // pcomb
  '0xf521d590fb1e0b432fd0e020cdbd6c6397d652c2', // par
  '0x4de7fea447b837d7e77848a4b6c0662a64a84e14', // wave
  '0xb371248dd0f9e4061ccf8850e9223ca48aa7ca4b', // hny
  '0xd85d1e945766fea5eda9103f918bd915fbca63e6', // cel
  '0x42435f467d33e5c4146a4e8893976ef12bbce762', // defi5
  '0x9c49ba0212bb5db371e66b59d1565b7c06e4894e', // cc10
  '0x8a953cfe442c5e8855cc6c61b1293fa648bae472', // polydoge
  '0x1e42edbe5376e717c1b22904c59e406426e8173f', // surf
  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0xe1c8f3d529bea8e3fa1fac5b416335a2f998ee1c', // lELK
  '0x05089c9ebffa4f0aca269e32056b1b36b37ed71b', // KRILL
  '0x3a3df212b7aa91aa0402b9035b098891d276572b', // FISH
  '0x2a93172c8dccbfbc60a39d56183b7279a2f647b4', // $DG
  '0x71b821aa52a49f32eed535fca6eb5aa130085978', // 0xBTC
  '0xf2ae0038696774d65e67892c9d301c5f2cbbda58', // CXO
  '0xd6df932a45c0f255f85145f286ea0b292b21c90b', // WAAVE
  '0x46f48fbdedaa6f5500993bede9539ef85f4bee8e', // ARIA20
  '0x7cdc0421469398e0f3aa8890693d86c840ac8931', // AZUKI
  '0x9c49ba0212bb5db371e66b59d1565b7c06e4894e', // CC10
  '0xd85d1e945766fea5eda9103f918bd915fbca63e6', // CEL
  '0xecf8f2fa183b1c4d2a269bf98a54fce86c812d3e', // CFI
  '0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c', // COMP
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
  '0x0e59d50add2d90f5111aca875bae0a72d95b4762', // DB
  '0x42435f467d33e5c4146a4e8893976ef12bbce762', // DEFI5
  '0x8a2870fb69a90000d6439b7adfb01d4ba383a415', // DEGEN
  '0xd28449bb9bb659725accad52947677cce3719fd7', // DMT
  '0xfed16c746cb5bfed009730f9e3e6a673006105c7', // DRC
  '0xa0e390e9cea0d0e8cd40048ced9fa9ea10d71639', // DSLA
  '0xdb3b3b147a030f032633f6c4bebf9a2fb5a882b5', // EASY
  '0xa1c09c8f4f5d03fcc27b456475d53d988e98d7c5', // eDAI
  '0x07738eb4ce8932ca961c815cb12c9d4ab5bd0da4', // ELET
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
  '0x4ebde54ba404be158262ede801744b92b9878c61', // eUSDC
  '0xfc39742fe9420a7af23757fc7e78d1c3ae4a9474', // eUSDT
  '0x104592a158490a9228070e0a8e5343b499e125d0', // FRAX
  '0x3e121107f6f22da4911079845a470757af4e1a1b', // FXS
  '0x8d1566569d5b695d44a9a234540f68d393cdc40d', // GAME
  '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7', // GHST
  '0x23d29d30e35c5e8d321e1dc9a8a61bfd846d4c5c', // HEX
  '0x521cddc0cba84f14c69c1e99249f781aa73ee0bc', // HH
  '0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff', // iFARM
  '0xe6fc6c7cb6d2c31b359a49a33ef08ab87f4de7ce', // IGG
  '0x313d009888329c9d1cf4f75ca3f32566335bd604', // LEND
  '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // WLINK
  '0x823cd4264c1b951c9209ad0deaea9988fe8429bf', // maAAVE
  '0xe0b22e0037b130a9f56bbb537684e6fa18192341', // maDAI
  '0x98ea609569bd25119707451ef982b90e3eb719cd', // maLINK
  '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4', // MANA
  '0xf4b8888427b00d7caf21654408b7cba2ecf4ebd9', // maTUSD
  '0x8c8bdbe9cee455732525086264a4bf9cf821c498', // maUNI
  '0x9719d867a500ef117cc201206b8ab51e794d3f82', // maUSDC
  '0xdae5f1590db13e3b40423b5b5c5fbf175515910b', // maUSDT
  '0x20d3922b4a1a8560e1ac99fba4fade0c849e2142', // maWETH
  '0xe20f7d1f0ec39c4d5db01f53554f2ef54c71f613', // maYFI
  '0x82b6205002ecd05e97642d38d61e2cfeac0e18ce', // mDEF
  '0x66768ad00746ac4d68ded9f64886d55d5243f5ec', // mRBAL
  '0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f', // MUST
  '0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea', // OM
  '0x127984b5e6d5c59f81dacc9f1c8b3bdc8494572e', // PPDEX
  '0x831753dd7087cac61ab5644b308642cc1c33dc13', // QUICK
  '0x03247a4368a280bec8133300cd930a3a61d604f6', // RBAL
  '0x48e3883233461c2ef4cb3fcf419d6db07fb86cea', // SENT
  '0xa1428174f516f527fafdd146b883bb4428682737', // SUPER
  '0x3809dcdd5dde24b37abe64a5a339784c3323c44f', // SWAP
  '0x043a3aa319b563ac25d4e342d32bffb51298db7b', // SWG
  '0x840195888db4d6a99ed9f73fcd3b225bb3cb1a79', // SX
  '0x7fbc10850cae055b27039af31bd258430e714c62', // UBT
  '0xb33eaad8d922b1083446dc23f610c2567fb5180f', // UNI
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  '0x034b2090b579228482520c589dbd397c53fc51cc', // VISION
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', // WBTC
  '0x72d6066f486bd0052eefb9114b66ae40e0a6031a', // WRX
  '0xf153eff70dc0bf3b085134928daeea248d9b30d0', // xMARK
  '0xda537104d6a5edd53c6fbba9a898708e465260b6', // YFI
  '0xe86e8beb7340659dddce61727e500e3a5ad75a90', // ZUT
  '0x033d942a6b495c4071083f4cde1f17e986fe856c', // AGA
  '0xf84bd51eab957c2e7b7d646a3427c5a50848281d', // AGAr
  '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8', // ANY
  '0xfdc26cda2d2440d0e83cd1dee8e8be48405806dc', // BTU
  '0x2727ab1c2d22170abc9b595177b2d5c6e1ab7b7b', // CTSI
  '0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c', // FSN
  '0x7075cab6bcca06613e2d071bd918d1a0241379e2', // GFARM2
  '0x282d8efce846a88b159800bd4130ad77443fa1a1', // mOCEAN
  '0x6968105460f67c3bf751be7c15f92f5286fd0ce5', // MONA
  '0xf7d9e281c5cb4c6796284c5b663b3593d2037af2', // NFTP
  '0x7ff2fc33e161e3b1c6511b934f0209d304267857', // OPU
  '0xe82808eaa78339b06a691fd92e1be79671cad8d3', // PLOT
  '0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32', // TEL
  '0xb77e62709e39ad1cbeebe77cf493745aec0f453a', // WISE
  '0x8f18dc399594b451eda8c5da02d0563c0b2d0f16', // WOLF
  '0x232eab56c4fb3f84c6fb0a50c087c74b7b43c6ad', // ZUZ
  '0xf89887862538ce8efbdbadd5d483ae4a09dd9688', // $TRDL
  '0x95c300e7740d2a88a44124b424bfc1cb2f9c3b89', // ALCX
  '0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360', // AMAAVE
  '0x27f8d03b3a2196956ed754badc28d73be8830a6e', // amDAI
  '0x1a13f4ca1d028320a707d99520abfefca3998b7f', // amUSDC
  '0x60d55f02a771d515e077c9c2403a1ef324885cec', // amUSDT
  '0x5c2ed810328349100a66b82b78a1791b101c9d61', // amWBTC
  '0x28424507fefb6f7f8e9d3860f56504e4e5f5f390', // amWETH
  '0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4', // amWMATIC
  '0x2628d301b161db70e3dbbac88d9d900ca426ff02', // bBADGER
  '0xfdde616084427f0a231d0664a985e1f820e34693', // bDIGG
  '0xfbdd194376de19a88118e84e279b977f165d01b8', // BIFI
  '0x032b3217241fe53ffadb334a9d06aacd2a9153d9', // BND
  '0x5c7f7fe4766fe8f0fa9b41e2e4194d939488ff1c', // DOKI
  '0x268ad27c28601d28b79c792c14e95bd2b7a030f8', // JULIEN
  '0x5f084f3ee7ea09e4c01cee3cdf1b5620a3344fd0', // KIF
  '0x220ed61d1f1cc754cb71978585d69e07be576315', // LADZ
  '0xf2b5a8c37278bcdd50727d5ca879f8e5a4642e2e', // MEME
  '0x2e220744f9ac1bf3045b0588d339f5fd3bb8623a', // MM
  '0x652e36ecfa0e4f7e435f6d38688d68a3be65639c', // mWBTC
  '0xdc0f3c12df89593357985491bdacc5fd789ca4b2', // mWETH
  '0xfb65ef42f7c8a70ff73f627db6e9ba2aff1f20fa', // NDR
  '0xd7ecf95cf7ef5256990beaf4ac895cd9e64cb947', // pBTC
  '0x2b88ad57897a8b496595925f43048301c37615da', // PICKLE
  '0xdd24aa9166dcdf0b37d0fca17d6ea87748771dcc', // PLAY
  '0xc91c06db0f7bffba61e2a5645cc15686f0a8c828', // RAZOR
  '0xeffca2dbb2d9f3816cee07ae2134574fa9210dcb', // RBAG
  '0x87f0bfee4435ce2b8643b221d0c1cad21f5328b4', // sd3Crv
  '0xe212f92e5af85268b33d2aa587b51f49c3b945be', // sdcrvRenWSBTC
  '0xfbdb45075fb73ca4cc8b83fd6fdb4f9b696b1ba1', // sdeursCRV
  '0x361a5a4993493ce00f61c32d4ecca5512b82ce90', // SDT
  '0xa79e0bfc579c709819f4a0e95d4597f03093b011', // STR
  '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a', // WSUSHI
  '0x1489f4f7e3a80a0ad9fa23c39d2e8af818204ce9', // vBTC
  '0x0c5ebed5cb5bd838bdc43e1583d9d054f3d7be6c', // VGTG
  '0xd921f8318cfd786bab1ea7492673f053c518ac04', // xSDT
  '0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539', // ADDY
  '0x669ddc70273084ea30e6cd4f28ca6e2c70735065', // AGAc
  '0xcbce9f77921c2e90522d438df4c5582f4c617768', // AGAcr
  '0x6c0ab120dbd11ba701aff6748568311668f63fe0', // APW
  '0xa649325aa7c5093d12d6f98eb4378deae68ce23f', // WBNB
  '0x6863bd30c9e313b264657b107352ba246f8af8e0', // BPT
  '0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0', // ELE
  '0xf4b0903774532aee5ee567c02aab681a81539e92', // GAJ
  '0x6a174b728d8b7c0c1f239910bb90b3540e1cc0dd', // gSAT
  '0xd93c61d4418d77a537b6b57478c108e193362f0c', // mBONK
  '0x9f5755d47fb80100e7ee65bf7e136fca85dd9334', // OM
  '0x7f426f6dc648e50464a0392e60e1bb465a67e9cf', // pAUTO
  '0xce829a89d4a55a63418bcc43f00145adef0edb8e', // renDOGE
  '0x9e01e0a928588ae6e669b8d1f0f1fa4ab976f617', // SHO
  '0xbbbe128568222623d21299f019a978c8587b33dc', // SWISE
  '0xaaa5b9e6c589642f98a1cda99b9d024b8407285a', // TITAN
  '0xc0f14c88250e680ecd70224b7fba82b7c6560d12', // wPTG
  '0xb3b681dee0435ecc0a508e40b02b3c9068d618cd', // YAM
  '0xb8ab048d6744a276b2772dc81e406a4b769a5c3d', // WUSD
  '0x4c4bf319237d98a30a929a96112effa8da3510eb', // WEXPOLY
  '0x37d1ebc3af809b8fadb45dce7077efc629b2b5bb', // PCOMB
  '0xf521d590fb1e0b432fd0e020cdbd6c6397d652c2', // PAR
  '0x4de7fea447b837d7e77848a4b6c0662a64a84e14', // WAVE
  '0x8a953cfe442c5e8855cc6c61b1293fa648bae472', // POLYDOGE
  '0x146e58d34eab0bff7e0a63cfe9332908d680c667', // PDDOLLAR
  '0x3068382885602fc0089aec774944b5ad6123ae60', // PDSHARE
  '0xb371248dd0f9e4061ccf8850e9223ca48aa7ca4b', // HNY
  '0x3053ad3b31600074e9a90440770f78d5e8fc5a54', // WAULTX
  '0xf239e69ce434c7fb408b05a0da416b14917d934e', // SHI3LD
  '0x1e42edbe5376e717c1b22904c59e406426e8173f', // SURF
  '0xd86d318f5241ecae47d6df5a9e2394fe19ccc4f9', // RAVEN
  '0xa3fa99a148fa48d14ed51d610c367c61876997f1', // MAI
  '0x580a84c73811e1839f75d86d75d88cca0c241ff4', // QiDAO
  '0x26d326b1fc702260baeb62334d7c1da6f1a2c386', // GTPS
  '0x613a489785c95afeb3b404cc41565ccff107b6e0', // RADIO
  '0x6e65ae5572df196fae40be2545ebc2a9a24eace9', // SHACK
  '0x65ba64899c2c7dbfdb5130e42e2cc56de281c78b', // DEXI
  '0xe0b52e49357fd4daf2c15e02058dce6bc0057db4', // agEUR
  '0x1c954e8fe737f99f68fa1ccda3e51ebdb291948c', // KNC
  '0x91993f2101cc758d0deb7279d41e880f7defe827', // gDAI
  '0xc15b6939e9941b3e6a9be9be172b4456878b7a62', // HOPE
  '0x9eb8a789ed1bd38d281962b523349d5d17a37d47', // XGTv3
  '0x1f89600a0a08bc51eef1bec8e1ca826145753052', // CREW
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
