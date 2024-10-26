/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'

export function getEthPriceInUSD(): BigDecimal {
  return ONE_BD
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  WETH_ADDRESS, // WETH

  '0xeeeeeb57642040be42185f49c52f7e9b38f8eeee', // ELK
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c', // oELK
  '0x8c88ea1fd60462ef7004b9e288afcb4680a3c50c', // 0xMR
  '0x7f7440c5098462f833e123b44b8a03e1d9785bab', // 1INCH
  '0xdf613af6b44a31299e48131e9347f034347e2f00', // WAAVE
  '0x5f1f81de1d21b97a5d0d5d62d89bde9ddec27325', // AC
  '0xbcfb2b889f7baa29dd7a7b447b6c87aca572f4f4', // ADAI
  '0xc81c785653d97766b995d867cf91f56367742eac', // AFI
  '0x3a97704a1b25f08aa230ae53b352e2e72ef52843', // AGVE
  '0xd27e1ecc4748f42e052331bea917d89beb883fc3', // AKRO
  '0xfb23cfd35046466fdba7f73dc2fccb5b17abf1aa', // ALBC
  '0x3581cc6a09de85e9b91ef93f2a5ef837706b84a5', // ALBT
  '0x4bc97997883c0397f556bd0f9da6fb71da22f9a2', // ALEPH
  '0xd51e1ddd116fff9a71c1b8feeb58113afa2b4d93', // AMIS
  '0xc84dd5b971521b6c9fa5e10d25e6428b19710e05', // AMPL
  '0x437a044fb4693890e61d2c1c88e3718e928b8e90', // ANTv1
  '0x6eeceab954efdbd7a8a8d9387bc719959b04b9ca', // ANTv2
  '0x44b6bba599f100006143e82a60462d71ac1331da', // API3
  '0x743a991365ba94bfc90ad0002cad433c7a33cb4a', // AST
  '0x8a95ea379e1fa4c749dd0a7a21377162028c479e', // AUDIO
  '0xcae40062a887581a3d1661d0ac2b481c32e3e938', // AUT
  '0xbde011911128f6bd4abb1d18f39fdc3614ca2cfe', // AXS
  '0xdfc20ae04ed70bd9c7d720f449eedae19f659d65', // BADGER
  '0x7ef541e2a22058048904fe5744f9c7e4c57af717', // BAL
  '0xe154a435408211ac89757b76c4fbe4dc9ed2ef27', // BAND
  '0x82dfe19164729949fd66da1a37bc70dd6c4746ce', // BAO
  '0xe0d0b1dbbcf3dd5cac67edaf9243863fd70745da', // BAOcx
  '0x699d001ef13b15335193bc5fad6cfc6747eee8be', // BASE
  '0xc6cc63f4aa25bbd4453eb5f3a0dfe546fef9b2f3', // BAT
  '0xfc8b2690f66b46fec8b3ceeb95ff4ac35a0054bc', // bDAI
  '0x778aa03021b0cd2b798b0b506403e070125d81c9', // BDT
  '0xf2197c8b553e37e949815360d5ca5e745e925511', // BFED
  '0x2977893f4c04bfbd6efc68d0e46598d27810d3db', // BID
  '0xec84a3bb48d70553c2599ac2d0db07b2dfdf6364', // BNS
  '0xbdb90bdadae84af0b07abf4cefcc7989f909f9bd', // BNSD
  '0x9a495a281d959192343b0e007284bf130bd05f86', // BNT
  '0xb31a2595e4cf66efbc1fe348b1429e5730891382', // BOND
  '0xb2ae7983a8142401d45546aab981e5fbff520991', // BTCCB
  '0xdd96b45877d0e8361a4ddb732da741e97f3191ff', // BUSD
  '0xd10cc63531a514bba7789682e487add1f15a51e2', // BUSDC
  '0xe6a1f98b0f4368559bd16639c844510f5db6fe48', // BZRX
  '0xdbf3ea6f5bee45c02255b2c26a16f300502f68da', // BZZ
  '0x0acd91f92fe07606ab51ea97d8521e29d110fd09', // CEL
  '0x248c54b3fc3bc8b20d0cdee059e17c67e4a3299d', // CELR
  '0x64b17a95e6c45306fb23bc526eb2dc9e1331a1b1', // CFXQ
  '0xeaf7b3376173df8bc0c22ad6126943cc8353c1ee', // CHEEMS
  '0x76eafffa1873a8acd43864b66a728bd873c5e08a', // CHSB
  '0x14411aeca652f5131834bf0c8ff581b5ddf3bc03', // COIN
  '0xdbcade285846131a5e7384685eaddbdfd9625557', // COLD
  '0xdf6ff92bfdc1e8be45177dc1f4845d391d3ad8fd', // COMP
  '0x1939d3431cf0e44b1d63b86e2ce489e5a341b1bf', // CREAM
  '0x712b3d230f3c1c19db860d80619288b1f0bdd0bd', // CRV
  '0x7da0bfe9d26c5b64c7580c04bb1425364273e4b0', // CVP
  '0x44fa8e6f47987339850636f88629646662444217', // DAI
  '0x4ef1d9a329a0cb0658156aff55c406cc4393a987', // DAIX
  '0xe4a2620ede1058d61bee5f45f6414314fdf10548', // DATA
  '0x1319067e82f0b9981f19191e1c08bb6e6e055dd3', // DDAI
  '0x48b1b0d077b4919b65b4e4114806dd803901e1d9', // DIP
  '0x7c16c63684d86bacc52e8793b08a5a1a3cb1ba1e', // DJ15
  '0x524b969793a64a602342d89bc2789d43a016b13a', // DONUT
  '0x6d237bb2248d3b40b1a54f3417667b2f39984fc8', // DOUGH
  '0xd3d47d5578e55c880505dc40648f7f9307c3e7a8', // DPI
  '0x8e7ab03ca7d17996b097d5866bfaa1e251c35c6a', // DUCK
  '0xb90d6bec20993be5d72a5ab353343f7a0281f158', // DXD
  '0x7a7d81657a1a66b38a6ca2565433a9873c6913b2', // ENG
  '0x5a757f0bcadfdb78651b7bdbe67e44e8fd7f7f6b', // ENJ
  '0x9bd5e0ce813d5172859b0b70ff7bb3c325cee913', // ETHM
  '0xb17d999e840e0c1b157ca5ab8039bd958b5fa317', // ETHO
  '0x6a8cb6714b1ee5b471a7d2ec4302cb4f5ff25ec2', // EWTB
  '0x270de58f54649608d316faa795a9941b355a2bd0', // FR
  '0x2bf2ba13735160624a0feae98f6ac8f70885ea61', // FRACTION
  '0xa106739de31fa7a9df4a93c9bea3e1bade0924e2', // FREE
  '0xde1e70ed71936e4c249a7d43e550f0b99fccddfc', // FSW
  '0x75886f00c1a20ec1511111fb4ec3c51de65b1fe7', // FTT
  '0x6f09cf96558d44584db07f8477dd3490599aa63e', // GEAR
  '0x12dabe79cffc1fde82fcd3b96dbe09fa4d8cd599', // GEN
  '0x30610f98b61593de963b2303aeeaee69823f561f', // GLDB
  '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO
  '0xfadc59d012ba3c110b08a15b7755a5cb7cbe77d7', // GRT
  '0xb0c5f3100a4d9d9532a4cfd68c55f1ae8da987eb', // HAUS
  '0xd9fa47e33d4ff7a1aca489de1865ac36c042b07a', // HEX
  '0x97e4ebc14c117c1ac2d032a5a8140c84628b0d17', // HIVESHARE
  '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9', // HNY
  '0xd057604a14982fe8d88c5fc25aac3267ea142a08', // HOPR
  '0x346b2968508d32f0192cd7a60ef3d9c39a3cf549', // HOT
  '0x5fe9885226677f3eb5c9ad8ab6c421b4ea38535d', // JOON
  '0x417602f4fbdd471a431ae29fb5fe0a681964c11b', // JPYC
  '0x1534fb3e82849314360c267fe20df3901a2ed3f9', // KNC
  '0x8fbedd16904b561e30ea402f459900e9d90614af', // LAYER
  '0xc1b42bdb485deb24c74f58399288d7915a726c1d', // LEND
  '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2', // WLINK
  '0xf99efeb34aff6d3099c41605e9ee778caec39317', // LOCK
  '0x7db0be7a41b5395268e065776e800e27181c81ab', // LPT
  '0x2be73bfeec620aa9b67535a4d3827bb1e29436d1', // LRC
  '0xcf9dc2de2a67d7db1a7171e3b8456d2171e4da75', // LTI
  '0x79cf2029717e2e78c8927f65f079ab8da21781ee', // LYXe
  '0x7838796b6802b18d7ef58fc8b757705d6c9d12b3', // MANA
  '0x7122d7661c4564b7c6cd4878b06766489a6028a2', // WMATIC
  '0xd361c1fd663d8f2dc36ae07ff6f3623532cabdd3', // MCB
  '0xc577cddabb7893cc2ca15ef4b5d5e5e13c3feed3', // MCDC
  '0xbab3cbdcbcc578445480a79ed80269c50bb5b718', // MDZA
  '0x512a2eb0277573ae9be0d48c782590b624048fdf', // MEME
  '0xe7ef58d8180cc269c6620ded3e6cc536a52e2ebd', // MESH
  '0xb4b6f80d8e573e9867c90163bfdb00e29d92716a', // MET
  '0x63e62989d9eb2d37dfdb1f93a22f063635b07d51', // MIVA
  '0x5fd896d248fbfa54d26855c267859eb1b4daee72', // MKR
  '0x5b917d4fb9b27591353211c32f1552a527987afc', // MOON
  '0xcc043d8820a6dc3e74ef6fb4772fae00c1563489', // MRP
  '0x26dc03e492763068ccfe7c39b93a22442807c360', // NEXO
  '0x1a186e7268f3ed5adfea6b9e0655f70059941e11', // NIF
  '0xc60e38c6352875c051b481cbe79dd0383adb7817', // NODE
  '0x26dd64bdcb2faf4f7e49a73145752e8d9cb34c94', // NPXS
  '0x0dcfed2c3041e66b2d8c4ea39782c60355716316', // NRGE
  '0x51732a6fc4673d1acca4c047f5465922716508ad', // OCEAN
  '0x309bc6dbcbfb9c84d26fdf65e8924367efccbdb9', // OM
  '0x8395f7123ba3ffad52e7414433d825931c81c879', // OMG
  '0x0905ab807f8fd040255f0cf8fa14756c1d824931', // OWL
  '0x981fb9ba94078a2275a8fc906898ea107b9462a8', // PAN
  '0x7ecf26cd9a36990b8ea477853663092333f59979', // PERP
  '0x6099280dc5fc97cbb61b456246316a1b8f79534b', // PGT
  '0x7ea8af7301b763451b7fb25f8fc2406819a7e36f', // PHA
  '0x317eab07380d670ea814025cba40f5624354a32f', // PIE
  '0x37b60f4e9a31a64ccc0024dce7d0fd07eaa0f7b3', // PNK
  '0x985e144eb355273c4b4d51e448b68b657f482e26', // POA20
  '0x75481a953a4bba6b3c445907db403e4b5d222174', // POLS
  '0xa9e5cd4efc86c01fae9a9fcd6e8669b97c92a937', // PROPHET
  '0xb5d592f85ab2d955c25720ebe6ff8d4d1e1be300', // PRTCLE
  '0x53ef00be819a062533a0e699077c621a28eaded1', // PTF
  '0x57e93bb58268de818b42e3795c97bad58afcd3fe', // RAREV2
  '0x4be85acc1cd711f403dc7bde9e6cadfc5a94744b', // RARI
  '0x0da1a02cdf84c44021671d183d616925164e08aa', // REN
  '0x4a88248baa5b39bb4a9caa697fb7f8ae0c3f0ddb', // renBTC
  '0x5f2852afd20c39849f6f56f4102b8c29ee141add', // renZEC
  '0x1479ebfe327b62bff255c0749a242748d3e7347a', // RING
  '0x60e668f54106222adc1da80c169281b3355b8e5d', // RLC
  '0x8d02b73904856de6998ffdf6e7ee18cc21137a79', // ROBOT
  '0x2f0e755efe6b58238a67db420ff3513ec1fb31ef', // RPL
  '0x5a87eac5642bfed4e354ee8738dacd298e07d1af', // RSR
  '0x5c8c83e5d5f7be815863b810d45d7bc706d7b15b', // rSURF
  '0x6b0f8a3fb7cb257ad7c72ada469ba1d3c19c5094', // RXDAI
  '0xc439e5b1dee4f866b681e7c5e5df140aa47fbf19', // SAI
  '0x8f365b41b98fe84acb287540b4b4ab633e07edb2', // SETH
  '0x27b9c2bd4baea18abdf49169054c1c1c12af9862', // SNAFU
  '0x044f6ae3aef34fdb8fddc7c05f9cc17f19acd516', // SNT
  '0x3a00e08544d589e19a8e7d97d0294331341cdbf6', // SNX
  '0x35f346cb4149746272974a92d719fd48ae2f72fa', // SOCKS
  '0x5bbfbfb123b72a255504be985bd2b474e481e866', // SORA
  '0xb7d311e2eb55f2f68a9440da38e7989210b9a05e', // STAKE
  '0xbc650b9cc12db4da14b2417c60ccd6f4d77c3998', // STORJ
  '0xc12956b840b403b600014a3092f6ebd9259738fe', // SURF
  '0xb1950fb2c9c0cbc8553578c67db52aa110a93393', // sUSD
  '0x2995d1317dcd4f0ab89f4ae60f3f020a4f17c7ce', // WSUSHI
  '0xeaacce3e5bcc10fb32c2553f8d6fc4c3888ffdad', // SWAP
  '0xc45b3c1c24d5f54e7a2cf288ac668c74dd507a84', // SYMM
  '0x0811e451447d5819976a95a02f130c3b00d59346', // TBTC
  '0xb7d918d7631fcdd0954205e3a6b205a10a31a085', // TECH
  '0x16afe6e6754fa3694afd0ce48f4bea102efacc17', // TESTA
  '0xeddd81e0792e764501aae206eb432399a0268db5', // TRAC
  '0x860182180e146300df38aab8d328c6e80bec9547', // TRADE
  '0xff0ce179a303f26017019acf78b951cb743b8d9b', // TRIB
  '0x479e32cdff5f216f93060700c711d1cc8e811a6b', // TRIPS
  '0xb714654e905edad1ca1940b7790a8239ece5a9ff', // TUSD
  '0xeb2bcabb0cdc099978a74cfe4ab4d45e7e677a45', // TVK
  '0xd3b93ff74e43ba9568e5019b38addb804fef719b', // UBT
  '0x703120f2f2011a0d03a03a531ac0e84e81f15989', // UNCL
  '0x0116e28b43a358162b96f70b4de14c98a4465f25', // UNCX
  '0x4537e328bf7e4efa29d05caea260d7fe26af9d74', // UNI
  '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
  '0x4ecaba5870353805a9f068101a40e0f32ed605c6', // USDT
  '0x020ae8fc1c19f4d1312cf6a72291f52849791e7c', // VXV
  '0xca8d20f3e0144a72c6b5d576e9bd3fd8557e2b04', // WBNB
  '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252', // WBTC
  '0x7211ab649a4139561a152b787de52d257cbaaee9', // WCHI
  '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // ETH
  '0x01e92e3791f8c1d6599b2f80a4bff9b43949ac7c', // wNXM
  '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WXDAI
  '0x2f9cebf5de3bc25e0643d0e66134e5bf5c48e191', // xBRICK
  '0x38fb649ad3d6ba1113be5f57b927053e97fc5bf7', // XCOMB
  '0xf1738912ae7439475712520797583ac784ea9033', // XGT
  '0xc25af3123d2420054c8fcd144c21113aa2853f39', // XGTV2
  '0x3e33cf23073fd8d5ad1d48d1860a96c0d8e56193', // xMARK
  '0x1e16aa4df73d29c029d94ceda3e3114ec191e25a', // XMOON
  '0x42c6b3ac30ae82d754498f56d9372f0070349409', // xREAP
  '0xf54b47b00b6916974c73b81b7d9929a4f443db49', // XRT
  '0x2fd0c73ad006407f0a96c984f06a9ce8415b094e', // xSEED
  '0xfd4e5f45ea24ec50c4db4367380b014875caf219', // XYO
  '0x22bd2a732b39dace37ae7e8f50a186f3d9702e87', // yCRV
  '0xbf65bfcb5da067446cee6a706ba3fe2fb1a9fdfd', // YFI
  '0xa2fec95b3d3fecb39098e81f108533e1abf22ccf', // YLD
  '0x226bcf0e417428a25012d0fa2183d37f92bcedf6', // ZRX
  '0x21a42669643f45bc0e086b8fc2ed70c23d67509d', // FOX
  '0x83ff60e2f93f8edd0637ef669c69d5fb4f64ca8e', // BRIGHT
  '0x988d1be68f2c5cde2516a2287c59bd6302b7d20d', // PUNK
  '0x3f56e0c36d275367b8c502090edf38289b3dea0d', // MAI
  '0xdfa46478f9e5ea86d57387849598dbfb2e964b02', // QiDAO
  '0xd3226b12e6188133b19ac0419f34b0ed5b10f069', // ESR
  '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75', // GIV
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
