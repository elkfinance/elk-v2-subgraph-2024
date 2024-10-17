/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
const USDT_WETH_PAIR = '0x0826e1a55ebef25d725bb944555f714db84d95bb'
const USDCe_WETH_PAIR = '0x490c69b3a746a10b163f1e9a5674f2057d3d956f'
const DAIe_WETH_PAIR = '0xdfff750529a2eaba8b13e1b81f054ede83ca52a2'
const USDTe_WETH_PAIR = '0x563d2d28ea10691bae85838d1ee8f1397217b252'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiePair = Pair.load(DAIe_WETH_PAIR) // daie is token1
  let usdcePair = Pair.load(USDCe_WETH_PAIR) // usdce is token0
  let usdtePair = Pair.load(USDTe_WETH_PAIR) // usdte is token1
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  if (daiePair !== null && usdcePair !== null && usdtePair !== null) {
    let totalLiquidityETH = daiePair.reserve0.plus(usdcePair.reserve1).plus(usdtePair.reserve0)
    let daieWeight = daiePair.reserve0.div(totalLiquidityETH)
    let usdceWeight = usdcePair.reserve1.div(totalLiquidityETH)
    let usdteWeight = usdtePair.reserve0.div(totalLiquidityETH)
    return daiePair.token1Price.times(daieWeight)
      .plus(usdcePair.token0Price.times(usdceWeight))
      .plus(usdtePair.token1Price.times(usdteWeight))
    // dai and USDC have been created
  } else if (daiePair !== null && usdcePair !== null) {
    let totalLiquidityETH = daiePair.reserve0.plus(usdcePair.reserve1)
    let daieWeight = daiePair.reserve0.div(totalLiquidityETH)
    let usdceWeight = usdcePair.reserve1.div(totalLiquidityETH)
    return daiePair.token1Price.times(daieWeight).plus(usdcePair.token0Price.times(usdceWeight))
    // USDC is the only pair so far
  } else if (usdcePair !== null) {
    return usdcePair.token0Price
  }  else if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return ONE_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WAVAX
  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0xe1c8f3d529bea8e3fa1fac5b416335a2f998ee1c', // lELK
  '0x60781c2586d68229fde47564546784ab3faca982', // PNG
  '0xc38f41a296a4493ff429f1238e030924a1542e50', // SNOB
  '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd', // JOE
  '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4', // XAVA
  '0x846d50248baf8b7ceaa9d9b53bfd12d7d7fbb25a', // VSO
  '0x61ecd63e42c27415696e10864d70ecea4aa11289', // RUGPULL
  '0x6e7f5c0b9f4432716bdd0a77a3601291b9d9e985', // SPORE
  '0x1f1fe1ef06ab30a791d6357fdf0a7361b39b1537', // SFIN
  '0x2841a8a2ce98a9d21ad8c3b7fc481527569bd7bb', // SL3
  '0x3ab71ca6da13e50ab4966e3a0566d1b6b118c4ae', // ARFV2
  '0x78ea17559b3d2cf85a7f9c2c704eda119db5e6de', // AVE
  '0x65378b697853568da9ff8eab60c13e1ee9f4a654', // HUSKY
  '0x488f73cddda1de3664775ffd91623637383d6404', // YTS
  '0x617724974218a18769020a70162165a539c07e8a', // OLIVE
  '0xe896cdeaac9615145c0ca09c8cd5c25bced6384c', // PEFI
  '0x96ce026f10890f4836937e6fde75f13252fdf414', // POOLZ
  '0xa99dfda608d5c9e7f091e857efb256ceda48d57e', // ROPE
  '0xc8e94215b75f5b9c3b5fb041ec3a97b7d17a37ff', // ZRX
  '0xc309fd43f845a46aa2a4c75459b076543c6e9f4a', // 0xMR
  '0xe54eb2c3009fa411bf24fb017f9725b973ce36f0', // 1INCH
  '0xa477b670c46fe58cf48708d9519a5e8875a48062', // MPH
  '0x63a72806098bd3d9520cc43356dd78afe5d386d9', // AAVE.e
  '0x2c4ac7abe6d09f81a775de153e5593c8c56884eb', // ABYSS
  '0x0a15ed1b1f1be0b2024b4d22b4f19ebb99a6fd11', // AceD
  '0xedd6ce14626b228d90af0fb126a432e4b2174844', // ADX
  '0xcc6421b76190b5e7d1029824f6c988456c798291', // AGRI
  '0x2e1bc9fa6f579471e7e09084a054a858d792d981', // AID
  '0x086a23685f2a33bfdedf4ded738e9afddfb854ed', // AKRO
  '0x98e1cf8b9d1deb2f0c9f2a0a59ee2fb60a6f10c9', // ADEL
  '0x969a3f4481583843db706332e344412235c0892a', // ALEPH
  '0xc0c9b6714a482aad7b11327ccf4d7a0545a828a5', // ALBT
  '0x8ea071d1903b27ee57c82710b3a7cf660f285bb8', // ALPHA
  '0xc95f62a06ba7fb11389474ee1d4aa606a2a0d125', // AMN
  '0x74a13926df3e38a7bb7d12f566694f2e66ba145e', // AMP
  '0xd09af6a3c12ec24ced114a0829f5bf73d40dc5a8', // ANKR
  '0x68fa782392ff75689b6ee6e1559de2afc634dce8', // ANRX
  '0xbf853b96f95fae6883e9cbc813b4021fccf1eed4', // API3
  '0x524cefbad8aa1e7921d465a9f056fc52ff6a284f', // APY
  '0x6c67e7d38570d6c7fffdbb930cf204d97c62c470', // ANT
  '0xadcfcb796ab61ebcd0676c6b6e13a270fd55b402', // ASKO
  '0xada58d37d13ef5b665c46e474ac4d1aef12ebdb1', // ASTRO
  '0x77619878ccdd644dd5e67ca0f8f04dfaae42d542', // ATIS
  '0xaeadfdc09c284e848aeba876ff086ed06a95b4b2', // AUC
  '0x8e32f45c87b39f15529787a77cfa7ba48cfac7f0', // AUDIO
  '0x860d87c4ee3bf2f001a641e32fbef8f0342ba924', // AXS
  '0x17002a182b20f7a393808c5e013ec5fe770c9302', // BAC
  '0xa2a035dd93b0e963864fa14a240401d6ceac5558', // BAL
  '0xed44979561a797515767b0201121afc4b5ee2838', // BNT
  '0x764cc68cd46cb00644216682c3ee120b2f1eb5f6', // USDB
  '0x6fd02c0789797e595751208a2446faf721b9f3c2', // BAND
  '0xd02d849512780bf29cf48d56900a4b025e478d3e', // VLT
  '0x353be78373b6b75b5a61d952fcccb95c1d3e0bc8', // BAO
  '0x59cd8bb3e49930f313ed744585e4067bc45cf85d', // BOND
  '0x3f4409c13c3bb310317643c6ee15576b3d427ddd', // BAS
  '0x6b329326e0f6b95b93b52229b213334278d6f277', // BAT
  '0xf7427e4a97f3c68febc6e6a90632c369524db9ea', // BCS
  '0xa6c55d876e920e34203072891c720ac19f425a2b', // BETR
  '0xaeb044650278731ef3dc244692ab9f64c78ffaea', // oldBUSD
  '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39', // BUSD
  '0xc83f0172352692a4481dbf07ddd9f0e3dc5c70d1', // BIRD
  '0x024fc8fe444cff7682499c08f5bb14241e082d49', // CAT
  '0xc5bac6dc06d1fc9f5ed7b0a04d08747b4c938b6d', // BTSG
  '0x1f5ae9f37a18aa6797cdb58838f2e05160082ae7', // XBP
  '0xeee72b81fc4cf5a4bf9dc10c1d12f73c440ff7e9', // BLY
  '0x57d4a335260af430f5e0754d99d20da2f1528bdf', // BCDT
  '0xfe017733ff7e4d2ae17c98b2774fb4d5e3ea46dd', // VEE
  '0x6572450e88918154b6f059aa7fcaba37f5ddc490', // BLZ
  '0xd61b293aefb71f9b83670133d1faad8487567a53', // BONDLY
  '0x7ffc73532e29ac0845e494ec021f1a0791ebd4a7', // BOOST
  '0x4acea0eb348a6db49cb3f8a1d62625342d5f8751', // BOT
  '0x211960f8260db1b0171c33931a2aefd9562592b0', // BTU
  '0xb2fb27f45189f3c621545e5e3aae668a9b1bdf1d', // CAP
  '0x6b289cceaa8639e3831095d75a3e43520fabf552', // CTSI
  '0xeed4dcdfae91d39d2b851338433f0013af5d1406', // CBIX7
  '0xefb603a7844f11d17ada15b63e3a876ab443372c', // COL
  '0x53ceedb4f6f277edfddedb91373b044fe6ab5958', // COMP
  '0xdf9a6628235c90da0a475519d85c9cffa2a11d4c', // CVP
  '0xa8ce5107a2770959edb27529e56e84e11ef55a58', // COT
  '0xe0976dca075c4055cada33c2452429572885ae7e', // COVER
  '0xb9ab39f9b4e3af0c97ae55ea48a960656c681a88', // CREAM
  '0x3a9ea8880643211413609a7b717e3884816d15e7', // cyUSD
  '0x3e8a3b1db5401938f6f34e4e6f2560354c182c46', // XCHF
  '0x422b2328a16b41ecca56e1854be9943526ad7647', // CUDOS
  '0x06f9fd59d9e009e7e47a07df79bc994a07dcfb95', // CUR
  '0x424587bece1a7436ae4a38ed9e8686992236618b', // CORE
  '0xd77b301d644608ee1e3dc56c3cf8540e6c9ec60f', // CFi
  '0x2263483b187d8c99d1e7d1f737183097c7071fe2', // GEN
  '0xa449de69b549b416690ab15d2e67e7fccd464347', // DEBASE
  '0xdc6d33821606f6c5ffced7bb315152210f3f31d9', // DEC
  '0x332877d7b83d98efc3e22c203c54e6e62f7f35e9', // MANA
  '0xa571971cd50b3c17c9f82f43965319907d50341e', // DIP
  '0x71645323f647488209eaab8d08900576502160c8', // DUSD
  '0x30eb0d35147b7a40db1a54a98f25317e844670e5', // DFD
  '0x7fa965ebd5bbbee983681e571091a31dddb2e510', // FIN
  '0x8320c3cd3a0d671650f5600cc9d907749aeda7e1', // PIE
  '0x150dc9795908a27988abf71c30e9b1647922a7b3', // DPI
  '0x5ec7e661fb06ccfbc371fb463a284705d53df32a', // DTH
  '0xd7c26758ca255fb1d7559b02ff36295be61f6822', // DEV
  '0x5574edff4ef9fce15b22ddb37a7f419b2abd729e', // DEXE
  '0x618b994f06f7168bd3e24c05321ccf0afd30d6bc', // DEXT
  '0x30d26864af10565cedd9e4d5b1fdbd52b49144dd', // BUIDL
  '0x933753c297ade672d68fa3296fdaffd76db7dfa2', // buidl
  '0xe3edb25e952e9b3575efb71de14651ef3f2e8faf', // GOLDx
  '0xee33c5804b759ccf3a9de88c9e772374147dcdee', // DHT
  '0xd072deceb5fd919bf8853ceb1068438652a06c00', // DIA
  '0x6cb5008ca0cc13862cb47906f541672e8f51a6ef', // mDAI
  '0x6fec3a5e49748088c2b9b1ef9a6a762abdd07805', // mETH
  '0xe9925cd8639c21dfcea667d40dd2c8f54f420618', // DMG
  '0xf64dba678d653d5bb743b1e764de0a11fab0f0a3', // DMST
  '0x480d6193b2a2db2702f3ce6fe5bc1f0c8a95336b', // DODO
  '0xb2ef3c8a2b27c219fc3396f0e9320df0e29ec037', // DONUT
  '0x2c05b134888419b497fe5489d2762031a2de8031', // DOS
  '0xf40920212a74387387328db8e30726c0cc62ae33', // DDIM
  '0xce4af1de4a61c02e590ca8ad2a1493ff2a3d5fb5', // DSD
  '0x535e15b13f2a82350e8c02d62bdba385a6307c30', // eXRD
  '0x1830dd37a0ddd3207ffac9013e4f4d60fec22036', // WOZX
  '0xfcdf63735c1cf3203ce64fef59dca6a7ac9a6d54', // ELF
  '0x455b3fd5ef7bca83c0c1cd71695ec7aeda773e4f', // ESD
  '0x3447d187934d323bdd1bcc6edc643d3c8d05d86c', // EWTB
  '0xcde255522146ddf36d57ba5cd8d74695bd13c994', // ENJ
  '0x964a11836e6ac44e07f8632a9ff6c380ef0113fd', // EQMT
  '0xd7b63a3cf593e72c385a72e28029bcae6db766d5', // ETHRSIAPY
  '0xaef85e9f467b2dc187351b37bf63124c0a9bb913', // LEND
  '0xb98b8ea9e894caa5155da32646152303839890a3', // ETHV
  '0xc636ad16dd87c2d412d2c62276813dfc35558a81', // EVO
  '0x0dce209cd97c8bd136e433703645dc431ef93075', // XED
  '0x479914df5b637aa9d439246116d49245db678f97', // FSW
  '0x5e92fb74d337cd3914e0e48a7e679f87f2585471', // FARM
  '0x5dc1e85c8db7f79bbd63e6ae35abeb50ad55756d', // FERA
  '0x23d7e6af758883f4976617dab2641af94ff7ca1f', // FET
  '0x85b87e0a36865dbdef50bdfafb49b272077e0026', // FNX
  '0xad4c2ba8c983e6a06685b6f90d0c517cd3c4301e', // FTX
  '0xe9c418927b36f2668dc4fe02028aa08535a8e347', // FXC
  '0x5d1ce423031a2661f960740f15a93073e6ccab13', // FLIXX
  '0x23f3c4ff7ef5c752593966bde70de2db81398aa6', // FOAM
  '0x7e7034845b581b959ad90a6d7424382ddd70c196', // FOX
  '0xbb69c92fbb4f1aff528875056650c862f94d3cc1', // FRAX
  '0xb1ba5cf8eaa4d3c3439e91c190553e9c92e98e30', // FXS
  '0x3441061cbfdf2351e010df5d962f1cf0626cf19f', // FRONT
  '0x8a8dd8dd5639174f032877b2d6c7467d8b51d561', // iDAI
  '0x2ae2cd4e23c09a2b68a24d56d5cf3c4e887da849', // iETH
  '0xf8fc972343698ac3c466858ce6cf48bbc83a0852', // COMBO
  '0xd3974ae5a9bcd4ae4c9037a25a67374a11df4154', // FUSE
  '0x3326235ec1aff2799de463413114b800d251089d', // GEEQ
  '0x9d3b7a5e30654ab86039c929880b078b34c41625', // GVT
  '0x6419e589db783c5396d94f3237879a010fdb5c44', // GYSR
  '0x4f229ff652d4db584bf4b3512ae430edecb85971', // GHOST
  '0xbaa66822055ad37ec05638ec5aafdc6ef0e96445', // GNO
  '0x56f45ca7c6e8d5550b36f4c69a0dea44defee3ef', // MNTP
  '0x44d24df9732da8b230c819b0bf22b6c6377b42c4', // GOF
  '0x46c54b16af7747067f412c78ebadae203a26ada0', // GRT
  '0xbad7b06c436200db693dd49418a96e2bf857f9a2', // GRO
  '0xf21074038dc2ea2a280ec890be55ae3be84616e3', // HAKKA
  '0x20642e9cdd6bfe701817a7b50de89777c8f2b208', // HEGIC
  '0x79c340eafac9cc81d9bf128aa1785e669e06fbe2', // HEZ
  '0xa471033610995eedf0d6e4c598a4a9b4ec99c700', // HOT
  '0x2167d6a882e9beb324d08e6663d4d419ac578792', // HOLY
  '0x421b2a69b886ba17a61c7dad140b9070d5ef300b', // HT
  '0x59535b9ba6029edb7588df41ed388584fbea706c', // IDEX
  '0x3d26cefe5fae96ffd48801e1e61975b3cb75036b', // INDEX
  '0x7633b4710042f9dd22e3fc63e59e4bfdcb6813b9', // NDX
  '0xb9d0574a8049e5fd4331acdc1cf3ce2ff3261be9', // IND
  '0x1d590ad61a7b56071a5858301ace7dd3d31f0dd0', // INFI
  '0xfe057c0496ef3cca8d85d847da99c9815ba9981f', // INJ
  '0x703a3cc60e5e7ed2b28bdc50d66c260b4aab03dc', // XNK
  '0xc839e0d590bbb1b64a46a3f6ab6feb596ced7439', // JUL
  '0x1d81360dadf2e1756faeae46072dd12997170f46', // KAI
  '0x73945347fbcbfed872d590110f817621440a9d39', // KEEP
  '0xb42f2c83b4ee3c3620789b5603f4bdf01792e0a0', // KP3R
  '0xeeb395dec67742ccf7e6aea920dc2b7fcf01e725', // KP4R
  '0x833a32e28bbb289c0ba13c69a08db9e9526d4907', // KEN
  '0x47e4c63922766e1b386fa7296c994ac474062bd4', // kSEED
  '0xb7f7c9347f55d6d6265e152c636cd29ab17dc9f6', // KNC
  '0x4d49159f233506087426094cda371b5817f30331', // TAU
  '0x78c703129fa14c96164c6e14497edab6cf215a93', // LDC
  '0x4e0226a638adcbb43c99131c743b9aba15ff3040', // LST
  '0x548a24d7eb18ea8a771645651ee799807d41f2df', // LGCY
  '0xc162e489c7f39676f6376ca79df3e728f101a895', // LAR
  '0xb9b00fbac0f8b7c25a360664ce0bf819771b4144', // LID
  '0x2c67ec45b2e7138823dee0576d0d17ac6aa36b74', // LPT
  '0xb7617ad97645729f41cfd969312532e080f03864', // LOC
  '0xfa178938da2d58e55e52dc6db92b99d9b2102eae', // LOOM
  '0x628a9639cc78f46604a625452c0242c7b487ba3c', // LRC
  '0xecd99fe115553493c6bf41c27da69e131766baad', // LUA
  '0xcd82b8f5f145abb08f8c495bdb675d1ac4d40eb2', // LYXe
  '0x8a86e6dc6611c34d5c92fc563f426d2e378b3f1c', // LMY
  '0x8cfd9b30b18b3af9ce905561f749626ef06b1717', // MCX
  '0xb0cb6b9c9b47a3974044ae906e8865165d2e0889', // MAHA
  '0x254aa21d2996400b19cee93623c307d6e973ea3f', // MFT
  '0x33d6584872635e1ba681ad814b98b57198cf33ef', // OM
  '0xbeea21cc5d10e21df6ab42bd2d5e748e4ef59293', // POND
  '0x374c62a3b07350de41c4a95c4094474f84d7bf66', // MATH
  '0x885ca6663e1e19dad31c1e08d9958a2b8f538d53', // WMATIC
  '0xd4355f4608277a616111b35a77e6c58f4b4b69c6', // MCB
  '0x66a41bad9103435c57e1dabe10093dc5a19ee99f', // MDT
  '0x0c452ccc765ac4a5d90e40585487c482597dfdde', // MEGA
  '0x2bd2e0c3d39d6c82eaca300958aa2e4be6740223', // MLN
  '0xdc59a3ac96dc1e86bb93ed0248fb4ba6127ba64c', // LOCK
  '0x61eda5b986b9da6a67a2a128e67ee7ced890deab', // MTA
  '0x99b1b197d53511929a082ee66e7ac7e23257a4c4', // eMTRG
  '0x74f691fe2f89055cb1e641b840c8e7f12552dd6a', // MET
  '0x3c4dd53806347d37af1f9cca08c5aca7363abade', // MIC
  '0x1a4a456dcb9415d6fbac1148a656bd93a78c43e1', // MILK2
  '0xf553b0fa370e11d945d1eda4267437c9e4c51d8a', // MINI
  '0x7823daa7a5b86dd4e7a54c1ae70a14cf15758316', // MIS
  '0x77d208c2b37051957c2b7d88a3682c280d70e7e6', // MXT
  '0x4d06d5296c0be7857a9c43b5eb1770909d40cb25', // mUSD
  '0x3d7af5cc0143402a65d0ddc7e4c559fed65ae78c', // MYB
  '0xfe87aba89d58da09d5bc13b4a1dc873c1b901806', // NEXO
  '0x3e6867bb936e83bc686a89fdbfab3fd0d6ee3de8', // NBT
  '0x6169f17c609d14f253d0d54a96df6efd2a44147a', // Nsure
  '0x32141622a7c79790176670fffca17154678a9a24', // NU
  '0x57541c10591df7568bdc9d93f769d44eac1e3c3a', // NMR
  '0x0057371cd534577b6040e140654de0958116cf3a', // OCEAN
  '0xc0735f8b43b6879fed7070044211bfcd9c3d633b', // OCTO
  '0x27850fcbcff7dafb16176144b9193c6d310dcf72', // OM
  '0x276c6670b97f22ce7ad754b08cb330decb6a3332', // OMG
  '0xbaee145a92a0c7c2fed63d62d61e9b7eae0396d9', // ONG
  '0x2378b1eeb109bd40ff585ab9a92ac3fd9e90cee3', // OPT
  '0xd9a0b28305951758b9cdbbf7e18cc85b868f973c', // ORAI
  '0x9a1712dbed062db70c6c4c235be9dcd10a9dac59', // OGN
  '0x2796213bd26ce2270839b6d40e8d5904d8cdaa42', // ORO
  '0xe49403892253a3d7952a45d43c630126d0b8d1f2', // OWL
  '0x5b1cddc4e6c9e6864832954d0cf43f91952cd7b9', // PAMP
  '0xf6ef95fad0cdddfccc312679779516107a980e0a', // PAN
  '0x53b464bb9efebe9b314f97e631b47e1c0300fe21', // PAR
  '0x54266eda68834321b5bb81a8a8a48d5459c92456', // PARETO
  '0x6a8e6794ab77c63c3c90a62f1088f16ac61f463d', // PRQ
  '0x1687b16087b576e403c8d6926fbc0798e48fd0de', // PAXG
  '0x403985fd6628e44b6fca9876575b9503cb80a47a', // PAX
  '0x02f8a8e78e02768a5c2f9cf1bfa8ec2f821e869d', // PERX
  '0x8f4dee85b841723bdcecdc9ed68cda662f56e82a', // PERL
  '0x88af8d172e64326a71c1a7756cb4f6125d98f2a5', // PERP
  '0x5535483ed8781784b1b1cc431c4dc9c25d39ecb5', // PHA
  '0xd9ed8258c3ecbb5e4ecf3b91dc0ca693e80934cc', // PICKLE
  '0xd523c90acb4415a48e1504baad3a2aa8fd86def9', // PLR
  '0x3b295608d13083270214c0778624bcebca5df3da', // PPAY
  '0x5643c59d08d9ac382eeb224894608d52c7fcd908', // PLOT
  '0x680e3f5d629ecf176150e343d9efa1aa1062659d', // PLU
  '0xbc6e632244fd9a79e863b87841ffd9962b725895', // PLT
  '0xa4efc8d7007851cfe5313c02ac2516f33f199364', // PNT
  '0x153446d731f6a23661bebcd3e86431c36ba440fb', // POA20
  '0x3c09d70fb667e2b680d4fee2951d6bcd3f8fbaf9', // PBR
  '0x606e714710b0426d3e786394ada61d5b1492c39f', // CVR
  '0xe1463e8991c8a62e64b77b5fb6b22f190344c2a9', // POLS
  '0x1676c3d77ac75741678d6ca28f288352a57d0973', // POLY
  '0x606f5c16c01372c28345de54cf6f4ff901d934b6', // PIPT
  '0x01cc32a282050740a88c43dac0b56bf90f6435ef', // PTF
  '0x693656be08a4c74236110ccdf4da42ef31379e25', // PRDX
  '0x2a5a930d00110a4970bc68cf4bcb207588ca0d2d', // PROPS
  '0xe6338226c321f3089c645ab526f844713c2f7be3', // pBTC
  '0x07d83b7101c540fcc1720c3d51923f218ae9b6ac', // NPXS
  '0xc57719864387b11b8915ede8f84a8d2cca282451', // QDAO
  '0xa8990b4fa2ba67f3b14814be106b88f251397d3f', // eQUAD
  '0x4fcc1e009ef85b35d39b3fe533d27751e4cfa8f7', // QNT
  '0xa9b41c348717f755101189b907f37ee4ec703e8c', // QKC
  '0xbb9a99de392fb34d9f4f59c2b7ea72ce7f1570e4', // QRX
  '0x4732cc19937e4daf4bdca6698f2552b2e9f04813', // RAE
  '0x4a8918352ccb78cf6bd34bf89d501d5578ee6504', // RDN
  '0x182795ee69b458930633a60da79e8f9787a4828c', // RAMP
  '0x337e4ff263bc2e8dfb9a1a8a1af883f0adf953f0', // RGT
  '0x10d56b868a32670f27478ac628a2376a235f9bb8', // RARI
  '0x90557e63339caed393ee15cb6236bb746ded11d3', // REEF
  '0x8ff91e20aab3d5a21b0c5ecd45fc942c52f578b3', // REL
  '0xac6c38f2dec391b478144ae7f078d08b08d0a284', // REN
  '0xbe7afaa2833d7f461d8751f1f46bf259fc4459c6', // REPv2
  '0xb9924372ddc7e7f13757c8b9ae0f03906a684d65', // REP
  '0x8e729ad67d81d220b7ab6e00440f785bd08187fe', // REQ
  '0x91c20a30eba9795bbded46df9ad5b215dfa04fcd', // RSR
  '0x3361a925ecba04e4de70c0fa6310e710a2079a28', // RFuel
  '0xd2427c8a8da88c0ea24370a971dad6eed2ff63b7', // RCN
  '0x0cb3fe222303e1419ee73216e90322ae4635fc5e', // RWS
  '0x5cdad843078930c8feb1d50be474accf11b7ada1', // RPL
  '0x052c1e9de172366f30f300e805707a6520615977', // ROOK
  '0x88f87bb181cd974f3aae5002f5e6d4e1eb463f9c', // RBC
  '0x26526ebd75ed27d5b553d06d6bce8210ba0bc50b', // RVT
  '0x2a1f8a24575261919f839f4254fde9bc4b8ede7a', // SAFE2
  '0xa29d60ef9706571bbda9b505a117e1d36a0d683c', // SAND
  '0x8ae71c763700f22f1bb137f1d8767826d7f02d3a', // SAN
  '0x858950767b333d45b90c28709e97605e1829f907', // KEY
  '0x0680298eea69e413ed02b393fc269c2757033ab0', // SHAKE
  '0xccd9a2fa0a31506e5d881981b702e9476fefae56', // SHIP
  '0xdcd9b9b00a7ba3afb6e8f5058945a1a946810d29', // SPI
  '0x7de7dfe1a594bcbab1c0cd2ae0a530a019ce14ed', // ST
  '0x3365a191353a7670caac8b4be19c2f34dcd07320', // SRN
  '0x40eb65be917e7a5ae529b2e1279e4b548a36c465', // SNOW
  '0x307a2a7127429f0c24c607e4633d17b6e98e8372', // XOR
  '0x7583fd3aa918896700f4f106df7387e1943a31aa', // VAL
  '0x9e692659cdedf13e85eadc38fcf7bc9f6329db69', // SPC
  '0xadce0b08127efd11d4a6cdaa82fede77b0fa57f9', // SPANK
  '0x3bfcdb1ec986430fff0e35c00d71888d305e48f3', // SPD
  '0x5a21a9e09667a67a898de061d4bc61e92f20404e', // STBZ
  '0x540641c9b0fcb979496a8c03c711033239c841d5', // STAKE
  '0xc19cd5d80b52118a99b23941eaf1bb58bb79f1fa', // SDT
  '0x8194f4fe1fb50a945eb5db226689066be5e208d4', // STA
  '0x571fb151cc10f76d5a9a4b48f6d568fb7e1eebf8', // STONK
  '0xd6c7f1c0b553b820739a9befa30e1a4990db67dc', // STMX
  '0x232f79c05cb34de19c79104068e76452b624bab3', // STX
  '0xa62cbcb4f5485ee6ef6b44083c561f9e1f2b740a', // STM
  '0x7b73ceeed704556355d03af8888da3bcd4434cf9', // DATA
  '0xcf68248eef35b725512724178da55ad7db59a5f1', // STRONG
  '0xfa0bdf9df8bb8b3d7687a44dad2f69bc7a7b294f', // SURF
  '0x37b608519f91f70f2eeb0e5ed9af4061722e4f76', // SUSHI.e
  '0xe8dde6e36ae86e3c61dc13dff908b4a12d50f754', // SWAG
  '0x733793e8f93afd40d9322a4fba46de661e4f8b83', // SWFL
  '0x3afad3eb65deaf28f594958717530bc66d6cdd1c', // SXP
  '0xcff97feec839c59ba94fa453d47263a9cf4d4c28', // ESH
  '0x09f60a231c989d0c5adc9d3609936a3409885bd0', // SYN
  '0x68e44c4619db40ae1a0725e77c02587bc8fbd1c9', // SNX
  '0x1c24d4ef397f6f8c80403f52e9d11bef1d129a93', // TBTC
  '0x9d8ca87a15230b112d90f9eee7c1c6fdab92caed', // TEND
  '0xbdfc6443428decf3ccdc7472df5d96c2fa8c2e70', // PAY
  '0xbe53f019a8786227e3d258a47a0d96bcf24a09a6', // TVK
  '0x390ba0fb0bd3aa2a5484001606329701148074e6', // RUNE
  '0xbab918cfbd3c53ce1516e6aa97c8342b15c26bcc', // TBX
  '0x7657f9ee5f31868ccac0ec4306a92b0e2f5660d2', // TOMOE
  '0x7ccf19824c351e57c00633b46bbbff495e12d89d', // TORN
  '0xf981547a1d9a0c59c9aba1e2b826bf01a2e5e263', // DIS
  '0xdea3da33bdee64487358db66d9abc9ec256d1bfb', // TRAC
  '0x6b944c575376460edc27be19c999654e5982d971', // TNS
  '0x3a2d191ae83223ed0668d9aaf180be147ec05ad3', // TRND
  '0x82913383a48712c6a876e611a0412395b86e74b1', // TAUD
  '0xbf65c0f333954ebc49aab45fb6f04bee27f72495', // TCAD
  '0x9018775d36d3e39ae5d88a5f502d4cbe430734c5', // TGBP
  '0xc8eb95dac0033024b4b3fc87569824c4416f495d', // THKD
  '0xc458770b5fa66f4df1498c3d824261d5f5ec3582', // TUSD
  '0x0b483a7e8119d9f9fbff4a86cd751c51b6a81af9', // TRUST
  '0xc394fba894e6cd201478bc0f2ef121acb3182eb4', // TLN
  '0x17908a369a1884ce287bf79c269a16f0fb84082e', // SWAP
  '0x3f6372f530203daa26ef31f55017a36d6f7405e5', // 2KEY
  '0xfb59de6961d7d7d153bb82fcbcc2a7f5da8db56d', // PHOON
  '0xeaa4f0c8bdc6109c92f0a5be88a035ee11d40928', // uDOO
  '0xc84d7bff2555955b44bdf6a307180810412d751b', // UMA
  '0x8c32d46c073694045e8409251be1ffd6720a94f3', // UCAP
  '0xd084b89b8f04f3e2360ebd600360c358aa122bfb', // UNC
  '0xf8342ebdc7c4860fe16eab3318dda110305f6597', // LAYER
  '0xf5182c77b4a5dd11a59a83fb54abaf7dd3099041', // UFT
  '0xfbd70543a1456eca6570743256dc2d6e5ce43a2e', // POWER
  '0xf39f9671906d8630812f9d9863bbef5d523c84ab', // UNI
  '0xc95d97181857469f7d3ccacb20a84fc0dfd69a1b', // TRADE
  '0x7fb11d8945653f0978cca2ef51442bf31c84e142', // 1UP
  '0x28a9f61b5db4f4349c2edfe7a9b234f71e4ad2a7', // USDK
  '0x4247bea779fe14dabd38547a7ea49d7f57bd1bea', // USDQ
  '0x994921badc83d4f16eede22b81b64162c50a49eb', // UTK
  '0x5499b77d5ddc35680a26ff270d96a5c2eb859df4', // VALOR
  '0x05fe3039ecc7e03342521f583e9b3bb8b1bf5eb1', // VALUE
  '0x81c8d264f14bf69a083446fd19ffe9a8fe80e3c0', // VIB
  '0xe1df06e09531aed339cf6c97beb59de94675d5a8', // VIDT
  '0x3acf5dfe16ce85ed98339dfebf2283537f2229d0', // VSN
  '0xb6f1a43ccc654026dead1b566b948dbfba23f75a', // WINGS
  '0x5940b937d1dc86bd44e535b75c95e9ba10e1ac33', // WISE
  '0xd3e6c7e9dc08173276a17d23546cb9c24d7cd7b0', // wANATHA
  '0x3585e1f43af5a0e5a9429a8058bdf999ed67f81d', // wNXM
  '0x974e0e514d1413001201d5a629ff8defd188e3fd', // X8X
  '0x3a162d08fbfa687ca00f5682c5c4f51b3aee181c', // XDCE
  '0x1ce24ac9ec3fbc4ba0c3836123953ea0c86336b9', // XIO
  '0x977788025632e20360e4bb4867ef2c498a4ee4a6', // YAX
  '0x23f717b177eaf0bb93a726d2b8c4bd11d4c4950b', // yyDAI+yUSDC+yUSDT
  '0x99519acb025a0e0d44c3875a4bbf03af65933627', // YFI
  '0xfc492b9dc6ade871c20e9169f2600dfd2718df4e', // YFM
  '0xe09cd46bbe2144b53c6265c2d1b3d01cfdadb786', // Yf-DAI
  '0x5777e014b585a5f05db9902ef944df9c45f2054c', // YFFI
  '0xa0e1645a594a3ac2556ad0707d89b908b1a17d03', // YFII
  '0xe3a13e41ecadcc611a5d8415c2b8c0802197ba96', // YFL
  '0xd79fa6ac3d484cbbcbe3208518bd4ae03519e0db', // YFV
  '0x0439b92098bf71dd4abf1ba73b974a8c52f1f5f3', // SAFE
  '0x9bdd302e506c3f6c23c085c37789cce6d3c1a233', // ZERO
  '0x58dc26da5bfc714f73fd4a4dc768901ed9b8ed1a', // ZEE
  '0x14b1f37c46ecf29c9657585df0dd7cee1ec7c569', // ZINC
  '0x5ed880a1a8e25515d2e881eeba115462b824ac5b', // ZIPT
  '0x40871a08cd7b9751639a0831e5a83808f4c7eba9', // ZKS
  '0xf9f0bb57d247a8c55c463b9a231de7e998bdc9a0', // zLOT
  '0x8df92e9c0508ab0030d432da9f2c65eb1ee97620', // MKR
  '0x59414b3089ce2af0010e7523dea7e2b35d776ec7', // YAK
  '0x1ecd47ff4d9598f89721a2866bfeb99505a413ed', // AVME
  '0xa1144a6a1304bd9cbb16c800f7a867508726566e', // BAG
  '0x4c9b4e1ac6f24cde3660d5e4ef1ebf77c710c084', // LYD
  '0xd606199557c8ab6f4cc70bd03facc96ca576f142', // GDL
  '0xb1466d4cf0dcfc0bcddcf3500f473cdacb88b56d', // WET
  '0xa5e59761ebd4436fa4d20e1a27cba29fb2471fc6', // SHERPA
  '0x82fe038ea4b50f9c957da326c412ebd73462077c', // HAT
  '0x397bbd6a0e41bdf4c3f971731e180db8ad06ebc1', // AVXT
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI.e
  '0x5947bb275c521040051d82396192181b413227a3', // LINK.e
  '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT.e
  '0x50b7545627a5162f82a992c33b87adc75187b218', // WBTC.e
  '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH.e
  '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15', // oETH
  '0x78c42324016cd91d1827924711563fb66e33a83a', // RELAY
  '0xd769bdfc0caee933dc0a047c7dbad2ec42cfb3e2', // CHART
  '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5', // QI
  '0x440abbf18c54b2782a4917b80a1746d3a2c2cce1', // SHIBX
  '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', // USDC.e
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
  '0xd039c9079ca7f2a87d632a9c0d7cea0137bacfb5', // APE-X
  '0x130966628846bfd36ff31a822705796e8cb8c18d', // MIM
  '0xacd7b3d9c10e97d0efa418903c0c7669e702e4c0', // ELE
  '0x1f1e7c893855525b303f99bdf5c3c05be09ca251', // SYN
  '0x4501e37a79cf953116331a105b3644d07b74c0f8', // SAFEMOONA
  '0xb54f16fb19478766a268f172c9480f8da1a7c9c3', // TIME
  '0x0dd2d581994132c919827a2d5401ed6ffdaeffc9', // SUS
  '0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98', // FRAX
  '0xdd453dbd253fa4e5e745047d93667ce9da93bbcf', // ZABU
  '0x5c49b268c9841aff1cc3b0a418ff5c3442ee3f3b', // MAI
  '0x90842eb834cfd2a1db0b1512b254a18e4d396215', // GB
  '0xce1bffbd5374dac86a2893119683f4911a2f7814', // SPELL
  '0x21c5402c3b7d40c89cc472c9df5dd7e51bbab1b1', // TUNDRA
  '0xdd57fa6a38326b5c040a6bfce7a0a7c65588175a', // DUNE
  '0x100cc3a819dd3e8573fd2e46d1e66ee866068f30', // DCAU
  '0x346a59146b9b4a77100d369a3d18e8007a9f46a6', // AVAI
  '0x8b1d98a91f853218ddbb066f20b8c63e782e2430', // ORCA
  '0x4aca0ad6357b918e3d06bb1a0bcc403619177523', // SONIC
  '0xa56f9a54880afbc30cf29bb66d2d9adcdcaeadd6', // QiDAO
  '0x7086e045b78e1e72f741f25231c08d238812cf8a', // RACEX
  '0xae4aa155d2987b454c29450ef4f862cf00907b61', // THO
  '0x47eb6f7525c1aa999fbc9ee92715f5231eb1241d', // MELT
  '0x026187bdbc6b751003517bcb30ac7817d5b766f8', // H2O
  '0x094bd7b2d99711a1486fb94d4395801c6d0fddcc', // TEDDY
  '0xf7262d90250453dfba6aafa4d842555d45c901b1', // CC
  '0x9c5bbb5169b66773167d86818b3e149a4c7e1d1a', // RADI
  '0xf32398dae246c5f672b52a54e9b413dffcae1a44', // KACY
  '0x449674b82f05d498e126dd6615a1057a9c088f2c', // LOST
  '0x3eefb18003d033661f84e48360ebecd181a84709', // ISA
  '0x695fa794d59106cebd40ab5f5ca19f458c723829', // HAKU
  '0xd13eb71515dc48a8a367d12f844e5737bab415df', // SFI
  '0xb27c8941a7df8958a1778c0259f76d1f8b711c35', // KLO
  '0x02bfd11499847003de5f0f5aa081c43854d48815', // RADIO
  '0xaec8318a9a59baeb39861d10ff6c7f7bf1f96c57', // agEUR
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
  '0x05f1938646a897008e813fb03ce7c575eae45738', // PR
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
