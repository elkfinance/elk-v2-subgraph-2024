/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

// ALWAYS IN LOWER CASE!!
const WETH_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const DAI_WETH_PAIR = '0x030779edf297a1177ecb18a6fdb0c415a841aef2'
const USDC_WETH_PAIR = '0xba6f62ad53e3883fabae0c10e2e0428e1328a96f'
const BUSD_WETH_PAIR = '0x3bf61046f9cb1833e25cbfa16533be2ad2b79fc8'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token0
  let busdPair = Pair.load(BUSD_WETH_PAIR) // busd is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && busdPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(busdPair.reserve0)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    let busdWeight = busdPair.reserve0.div(totalLiquidityETH)
    return daiPair.token0Price
      .times(daiWeight)
      .plus(usdcPair.token0Price.times(usdcWeight))
      .plus(busdPair.token1Price.times(busdWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price
  } else {
    // Hardcoded BNB price
    return ONE_BD.times(BigDecimal.fromString("450"))
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH

  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47', // ADA
  '0xfb6115445bff7b52feb98650c87f44907e58f802', // BAAVE
  '0x6bff4fb161347ad7de4a625ae5aa3a1ca7077819', // ADX
  '0xac51066d7bec65dc4589368da368b212745d63e8', // ALICE
  '0xc5e6689c9c8b02be7c49912ef19e79cf24977f03', // ALPA
  '0x8f0528ce5ef7b51152a59745befdd91d97091d2f', // ALPACA
  '0xa1faa113cbe53436df28ff0aee54275c13b40975', // ALPHA
  '0xdb021b1b247fe2f1fa57e0a87c748cc1e321f07f', // AMPL
  '0xf307910a4c7bbc79691fd374889b36d8531b08e3', // ANKR
  '0x5921dee8556c4593eefcfad3ca5e2f618606483b', // anyMTLX
  '0x37dfacfaeda801437ff648a1559d73f4c40aacb7', // APYS
  '0x6f769e65c14ebd1f68817f5f1dcdb61cfa2d6f7e', // ARPA
  '0x80d5f92c2c8c682070c95495313ddb680b267320', // ASR
  '0xa2120b9e674d3fc3875f415a7df52e382f141225', // ATA
  '0x25e9d05365c867e59c1904e7463af9f312296f9e', // ATM
  '0x0eb3a705fc54725037cc9e008bdede697f62f335', // ATOM
  '0xa184088a740c695e156f91f5cc086a06bb78b827', // AUTO
  '0x715d400f88c167884bbcc41c5fea407ed4d2f8a0', // AXS
  '0xdb8d30b74bf098af214e862c90e647bbb1fcc58c', // BABYCAKE
  '0xe02df9e3e622debdd69fb838bb799e3f168902c5', // BAKE
  '0x72faa679e1008ad8382959ff48e392042a8b06f7', // bALBT
  '0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18', // BAND
  '0x101d82428437127bf1608f699cd651e6abf9766e', // BAT
  '0x1f7216fdb338247512ec99715587bb97bbf96eae', // bBADGER
  '0x045c4324039da91c52c55df5d785385aab073dcf', // bCFX
  '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf', // BCH
  '0x5986d5c77c65e5801a5caa4fae80089f870a71da', // bDIGG
  '0x190b589cf9fb8ddeabbfeae36a813ffb2a702454', // BDO
  '0x8443f091997f06a61670b735ed92734f5628692f', // BEL
  '0xe0e514c71282b6f4e823703a39374cf58dc3ea4f', // BELT
  '0x250632378e573c6be1ac2f97fcdf00515d0aa91b', // BETH
  '0x81859801b01764d4f0fa5e64729f5a6c3b91435b', // BFI
  '0xca3f508b8e4dd382ee878a314789373d80a5190a', // BIFI
  '0x63870a18b6e42b01ef1ad8a2302ef50b7132054f', // BLK
  '0x08ba0619b1e7a582e0bce5bbe9843322c954c340', // BMON
  '0x4131b87f74415190425ccd873048c708f8005823', // bMXX
  '0xf35262a9d427f96d2437379ef090db986eae5d42', // bOPEN
  '0xffeecbf8d7267757c2dc3d13d730e97e15bfdf7f', // BORING
  '0xe64f5cb844946c1f102bd25bbd87a5ab4ae89fbe', // bROOBEE
  '0xf859bf77cbe8699013d6dbc7c2b926aaf307f830', // BRY
  '0x5a3010d4d8d3b5fb49f8b6e57fb9e48063f16700', // BSCPAD
  '0x5ac52ee5b2a633895292ff6d8a89bb9190451587', // BSCX
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTCB
  '0x78650b139471520656b9e7aa7a5e9276814a38e9', // BTCST
  '0x5a16e8ce8ca316407c6e6307095dc9540a8d62b3', // BTR
  '0x8595f9da7b868b1822194faed312235e43007b49', // BTT
  '0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51', // BUNNY
  '0xae9269f27437f0fcbc232d39ec814844a51d6b8f', // BURGER
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x211ffbe424b90e25a15531ca322adf1559779e45', // BUX
  '0xaec945e04baf28b135fa7c640f624f8d90f1c3a6', // C98
  '0x007ea5c0ea75a8df45d288a4debdd5bb633f9e56', // CAN
  '0x1613957159e9b0ac6c80e824f7eea748a32a0ae2', // CGG
  '0x20de22029ab63cf9a7cf5feb2b737ca1ee4c82a6', // CHESS
  '0xf9cec8d50f6c8ad3fb6dccec577e05aa32b224fe', // CHR
  '0x52ce071bd9b1c4b00a0b92d298c512478cad67e8', // COMP
  '0x96dd399f9c3afda1f194182f71600f1b65946501', // COS
  '0xd4cb328a82bdf5f03eb737f37fa6b370aef3e888', // CREAM
  '0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929', // CTK
  '0x810ee35443639348adbbc467b33310d2ab43c168', // CYC
  '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
  '0x3fda9383a84c05ec8f7630fe10adf1fac13241cc', // DEGO
  '0xe60eaf5a997dfae83739e035b005a33afdcc6df5', // DERI
  '0x039cb485212f996a9dbb85a9a75d898f94d38da6', // DEXE
  '0x9899a98b222fcb2f3dbee7df45d943093a4ff9ff', // DFD
  '0x42712df5009c20fee340b245b510c0395896cf6e', // DFT
  '0x9fdc3ae5c814b79dca2556564047c5e7e5449c19', // DG
  '0x233d91a0713155003fc4dce0afa871b508b3b715', // DITTO
  '0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2', // DODO
  '0xba2ae424d960c26247dd6c32edc70b295c744c43', // DOGE
  '0x844fa82f1e54824655470970f7004dd90546bb28', // DOP
  '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', // DOT
  '0xb2bd0749dbe21f623d9baba856d3b0f0e1bfec9c', // DUSK
  '0x758fb037a375f17c7e195cc634d77da4f554255b', // DVI
  '0xbf7c81fff98bbe61b40ed186e4afd6ddd01337fe', // EGLD
  '0x56b6fb708fc5732dec1afc8d8556423a2edccbd6', // EOS
  '0xa7f552078dcc247c2684336020c03648500c6d9f', // EPS
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // WETH
  '0x5512014efa6cd57764fa743756f7a6ce3358cc83', // EZ
  '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153', // FIL
  '0x4e6415a5727ea08aae4580057187923aec331227', // FINE
  '0x658a109c5900bc6d2357c87549b651670e5b0539', // FOR
  '0x25a528af62e56512a19ce8c3cab427807c28cc19', // FORM
  '0x393b312c01048b3ed2720bf1b090084c09e408a1', // FRIES
  '0x928e55dab735aa8260af3cedada18b5f70c72f1b', // FRONT
  '0x2090c8295769791ab7a3cf1cc6e0aa19f35e441a', // FUEL
  '0xc53708664b99df348dd27c3ac0759d2da9c40462', // GUM
  '0xaa9e582e5751d703f85912903bacaddfed26484c', // HAI
  '0x1d1eb8e8293222e1a29d2c0e4ce6c0acfd89aaac', // HAKKA
  '0xf79037f6f6be66832de4e7516be52826bc3cbcc4', // HARD
  '0x948d2a81086a075b3130bac19e4c6dee1d2e3fe8', // Helmet
  '0xd40bedb44c081d2935eeba6ef5a3c8a31a1bbe13', // HERO
  '0xc7d8d35eba58a0935ff2d5a33df105dd9f071731', // HGET
  '0xe1d1f66215998786110ba0102ef558b22224c016', // HOO
  '0x4fa7163e153419e0e1064e418dd7a99314ed27b6', // HOTCROSS
  '0x4e840aadd28da189b9906674b4afcb77c128d9ea', // HTB
  '0x9a319b959e33369c5eaa494a770117ee3e585318', // HYFI
  '0xc0eff7749b125444953ef89682201fb8c6a917cd', // HZN
  '0xb0e1fc65c1a741b4662b813eb787d369b8614af1', // IF
  '0xa2b726b1145a4773f68593cf171187d8ebe4d495', // INJ
  '0x9678e42cebeb63f23197d726b29b1cb20d0064e5', // IOTX
  '0x04c747b40be4d535fc83d09939fb0f626f32800b', // ITAM
  '0xc13b7a43223bb9bf4b69bd68ab20ca1b79d81c75', // JGN
  '0xc40c9a843e1c6d01b7578284a9028854f6683b1b', // JUV
  '0x4ba0057f784858a48fe351445c672ff2a3d43515', // KALM
  '0x5f88ab06e8dfe89df127b2430bba4af600866035', // KAVA
  '0xdae6c2a48bfaa66b43815c5548b10800919c993e', // KTN
  '0x1a2fb0af670d0234c2857fad35b789f8cb725584', // KUN
  '0x5d684adaf3fcfe9cfb5cede3abf02f0cdd1012e3', // LIEN
  '0x762539b45a1dcce3d36d080f74d1aed37844b878', // LINA
  '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd', // WLINK
  '0xb59490ab09a0f526cc7305822ac65f2ab12f9723', // LIT
  '0x9617857e191354dbea0b714d78bc59e57c411087', // LMT
  '0x4338665cbb7b2485a8855a139b75d5e34ab0db94', // LTC
  '0x857b222fc79e1cbbf8ca5f78cb133d1b7cf34bbd', // LTO
  '0x23e8a70534308a4aaf76fb8c32ec13d17a3bd89e', // lUSD
  '0x3947b992dc0147d2d89df0392213781b04b25075', // mAMZN
  '0x2fa5daf6fe0708fbd63b1a7d1592577284f52256', // MARSH
  '0x2ed9a5c8c13b93955103b9a7c167b67ef4d568a3', // MASK
  '0xf218184af829cf2b0019f8e6f0b2423498a36983', // MATH
  '0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377', // MBOX
  '0x49022089e78a8d46ec87a3af86a1db6c189afa6f', // mCOIN
  '0xacb2d47827c9813ae26de80965845d80935afd0b', // MCRN
  '0x62d71b23bf15218c7d2d7e48dbbd9e9c650b173f', // mGOOGL
  '0x5b6dcf557e2abe2323c48445e8cc948910d8c2c9', // MIR
  '0xb67754f5b4c704a24d2db68e661b2875a4ddd197', // MIX
  '0xa04f060077d90fe2647b61e4da4ad1f97d6649dc', // mNFLX
  '0xbd2949f67dcdc549c6ebe98696449fa79d988a9f', // MTRG
  '0xf215a127a196e3988c09d052e16bcfd365cd7aa3', // mTSLA
  '0x9f882567a62a5560d147d64871776eea72df41d3', // MX
  '0xa1303e6199b319a891b79685f0537d289af1fc83', // NAR
  '0x42f6f551ae042cbe50c739158b4f0cac0edb9096', // NRV
  '0x8cd6e29d3686d24d3c2018cee54621ea0f89313b', // NULS
  '0xf0e406c49c63abf358030a299c0e00118c4c6ba5', // NVT
  '0xbfa0841f7a90c4ce6643f651756ee340991f99d5', // NYA
  '0xee9801669c6138e84bd50deb500827b776777d28', // O3
  '0xcd40f2670cf58720b694968698a5514e924f742d', // ODDZ
  '0xf05e45ad22150677a017fbd94b84fbb63dc9b44c', // OG
  '0x658e64ffcf40d240a43d52ca9342140316ae44fa', // OIN
  '0x03ff0ff224f904be3118461335064bb48df47938', // ONE
  '0x04baf95fd4c52fd09a56d840baee0ab8d7357bf0', // ONE
  '0xfd7b3a77848f1c2d67e05e54d78d174a0c850335', // ONT
  '0xebd49b26169e1b52c04cfd19fcf289405df55f80', // ORBS
  '0xed28a457a5a76596ac48d87c0f577020f6ea1c4c', // pBTC
  '0xbcf39f0edda668c58371e519af37ca705f2bfcbd', // pCWS
  '0x0f9e4d49f25de22c2202af916b681fbb3790497b', // PERL
  '0x1796ae0b0fa4862485106a0de9b654efe301d0b2', // PMON
  '0xdaacb0ab6fb34d24e8a67bfa14bf4d95d4c7af92', // PNT
  '0xabae871b7e3b67aeec6b46ae9fe1a91660aadac5', // pOPEN
  '0x3fcca8648651e5b974dd6d3e50f61567779772a8', // POTS
  '0xaf53d56ff99f1322515e54fdde93ff8b3b7dafd5', // PROM
  '0xbc5609612b7c44bef426de600b5fd1379db2ecf1', // PSG
  '0xa1434f1fc3f437fa33f7a781e041961c0205b5da', // QKC
  '0x07aaa29e63ffeb2ebf59b33ee61437e1a91a3bb2', // QSD
  '0xb8c540d00dd0bf76ea12e4b4b95efc90804f924e', // QUSD
  '0x95a1199eba84ac5f19546519e287d43d2f0e1b41', // RABBIT
  '0x8519ea49c997f50ceffa444d240fb655e89248aa', // RAMP
  '0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e', // REEF
  '0xfce146bf3146100cfe5db4129cf6c82b0ef4ad8c', // renBTC
  '0xc3fed6eb39178a541d274e6fc748d48f0ca01cc3', // renDOGE
  '0x695fd30af473f2960e81dc9ba7cb67679d35edb7', // renZEC
  '0x833f307ac507d47309fd8cdd1f835bef8d702a93', // REVV
  '0x0a3a21356793b49154fd3bbe91cbc2a16c0457f5', // RFOX
  '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3', // SAFEMOON
  '0x0d9319565be7f53cefe84ad201be3f40feae2740', // sBDO
  '0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb', // SFP
  '0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab', // SKILL
  '0xe4ae305ebe1abe663f261bc00534067c80ad677c', // SPARTA
  '0x1633b7157e7638c4d6593436111bf125ee74703f', // SPS
  '0x0da6ed8b13214ff28e9ca979dd37439e8a88f6c4', // STAX
  '0x947950bcc74888a40ffa2593c5798f11fc9124c4', // BSUSHI
  '0x4cfbbdfbd5bf0814472ff35c72717bd095ada055', // SUTER
  '0xc5a49b4cbe004b6fd55b30ba1de6ac360ff9765d', // SWAMP
  '0xe792f64c582698b8572aaf765bdc426ac3aefb6b', // SWG
  '0x71de20e0c4616e7fcbfdd3f875d568492cbe4739', // SWINGBY
  '0x250b211ee44459dad5cd3bca803dd6a7ecb5d46c', // SWTH
  '0x47bead2563dcbf3bf2c9407fea4dc236faba485a', // SXP
  '0x2cd1075682b0fccaadd0ca629e138e64015ba11c', // tBTC
  '0xe550a593d09fbc8dcd557b5c88cea6946a8b404a', // tDOGE
  '0xdff8cb622790b7f92686c722b02cab55592f152c', // TEN
  '0xe898edc43920f357a93083f1d4460437de6daec2', // TITAN
  '0x9f589e3eabe42ebc94a44727b3f3531c0c877809', // TKO
  '0x2222227e22102fe3322098e4cbfe18cfebd57c95', // TLM
  '0xeca41281c24451168a37211f0bc2b8645af45092', // TPT
  '0x7af173f350d916358af3e218bdf2178494beb748', // TRADE
  '0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b', // TRX
  '0x14016e85a25aeb13065688cafb43044c2ef86784', // TUSD
  '0x4b0f1812e5df2a09796481ff14017e6005508003', // TWT
  '0x1ffd0b47127fdd4097e54521c9e2c7f0d66aafc5', // TXL
  '0xbbeb90cfb6fafa1f69aa130b7341089abeef5811', // UBXT
  '0x728c5bac3c3e370e372fc4671f9ef6916b814d8b', // UNFI
  '0xbf5140a22578168fd562dccf235e5d43a02ce9b1', // UNI
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0x1203355742e76875154c0d13eb81dcd7711dc7d9', // USDX
  '0x23396cf899ca06c4472205fc903bdb4de249d6fc', // UST
  '0x4bd17003473389a42daf6a0a729f6fdb328bbbd7', // VAI
  '0x5f84ce30dc3cf7909101c69086c50de191895883', // VRT
  '0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0', // WATCH
  '0xb64e638e60d154b43f660a6bf8fd8a3b249a6a21', // WAULTx
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  '0xf07a32eb035b786898c00bb1c64d8c6f8e7a46d5', // WELL
  '0xa9c41a46a6b3531d28d5c32f6633dd2ff05dfb90', // WEX
  '0xaef0d72a118ce24fee3cd1d43d383897d05b4e99', // WIN
  '0x7e396bfc8a2f84748701167c2d622f041a1d7a17', // WMASS
  '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
  '0xa58950f05fea2277d2608748412bf9f802ea4901', // WSG
  '0x541e619858737031a1244a5d0cd47e5ef480342c', // wSOTE
  '0x431e0cd023a32532bf3969cddfc002c00e98429d', // XCAD
  '0x5621b5a3f4a8008c4ccdd1b942b121c8b1944f1f', // XED
  '0x4a080377f83d669d7bb83b3184a8a5e61b500608', // XEND
  '0x26a5dfab467d4f58fb266648cae769503cec9580', // xMARK
  '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', // XRP
  '0x16939ef78684453bfdfb47825f8a5f714f12623a', // XTZ
  '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63', // XVS
  '0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e', // YFI
  '0x7f70642d88cf1c4a3a7abb072b53b929b653eda5', // YFII
  '0x1ba42e5193dfa8b03d15dd1b86a3113bbbef8eeb', // ZEC
  '0x44754455564474a89358b2c2265883df993b12f0', // ZEE
  '0x0328a69b363a16f66810b23cb0b8d32abadb203d', // KANA
  '0xb86abcb37c3a4b64f74f59301aff131a1becc787', // ZIL
  '0x617724974218a18769020a70162165a539c07e8a', // OLIVE
  '0x9c65ab58d8d978db963e63f2bfb7121627e3a739', // MDX
  '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95', // BANANA
  '0x8893d5fa71389673c5c4b9b3cb4ee1ba71207556', // NUTS
  '0x0742b62efb5f2eabbc14567dfc0860ce0565bcf4', // SOTA
  '0x3ff997eaea488a082fb7efc8e6b9951990d0c3ab', // WUSD
  '0x841dc7a49e0825bdf3ee585cfb6e553495915ace', // SOAK
  '0x4477b28e8b797ebaebd2539bb24290fdfcc27807', // RFG
  '0x3f56e0c36d275367b8c502090edf38289b3dea0d', // MAI
  '0xbdf7d9c4dd10dad74b46bfeeb58b2ce5ff055581', // GTPS
  '0x030708208dc29b1688b212081f31cdb59097a67d', // KBN
  '0x30807d3b851a31d62415b8bb7af7dca59390434a', // RADIO
  '0x8da443f84fea710266c8eb6bc34b71702d033ef2', // CTSI
  '0xc25af3123d2420054c8fcd144c21113aa2853f39', // XGTV2
  '0x3ca994d9f723736381d44388bc8dd1e7ee8c1653', // SMG
  '0xaa39b60b5c4273f659674b6b34e3f187d16e7cfd', // KOKU
  '0xcc42724c6683b7e57334c4e856f4c9965ed682bd', // MATIC
  '0x1ce0c2827e2ef14d5c4f29a091d735a204794041', // AVAX
  '0x8d1437a21f055b88c29a80ee65c400de8959525b', // RHINE
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
