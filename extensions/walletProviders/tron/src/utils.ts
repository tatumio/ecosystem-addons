import { ec as EC } from 'elliptic'
import { keccak_256 } from 'js-sha3'

function hexChar2byte(hexChar: string): number {
  const charCode = hexChar.charCodeAt(0)

  if (hexChar >= 'A' && hexChar <= 'F') {
    return charCode - 'A'.charCodeAt(0) + 10
  }
  if (hexChar >= 'a' && hexChar <= 'f') {
    return charCode - 'a'.charCodeAt(0) + 10
  }
  if (hexChar >= '0' && hexChar <= '9') {
    return charCode - '0'.charCodeAt(0)
  }

  throw new Error('Invalid hexadecimal character')
}

const isHexChar = (c: string) => (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f') || (c >= '0' && c <= '9') ? 1 : 0

function hexStr2byteArray(hexString: string): Uint8Array {
  const byteArray = new Uint8Array(Math.ceil(hexString.length / 2))
  let byteIndex = 0

  for (let i = 0; i < hexString.length; i += 2) {
    const hexChar1 = hexString.charAt(i)
    const hexChar2 = hexString.charAt(i + 1)

    if (isHexChar(hexChar1) && isHexChar(hexChar2)) {
      byteArray[byteIndex++] = (hexChar2byte(hexChar1) << 4) + hexChar2byte(hexChar2)
    } else {
      throw new Error('Invalid hexadecimal string')
    }
  }

  return byteArray
}

const byte2hexStr = (byte: number) => {
  const hexByteMap = '0123456789ABCDEF'

  let str = ''
  str += hexByteMap.charAt(byte >> 4)
  str += hexByteMap.charAt(byte & 0x0f)

  return str
}

const byteArray2hexStr = (byteArray: Uint8Array) => {
  let str = ''

  for (const byte of byteArray) {
    str += byte2hexStr(byte)
  }

  return str
}

const computeAddress = (pubBytes: Uint8Array) => {
  if (pubBytes.length === 65) pubBytes = pubBytes.slice(1)

  const hash = keccak_256(pubBytes).toString()
  const addressHex = '41' + hash.substring(24)

  return hexStr2byteArray(addressHex)
}

const generatePubKey = (bytes: Buffer): string => {
  const ec = new EC('secp256k1')
  const key = ec.keyFromPublic(bytes, 'bytes')
  const publicKey = key.getPublic()

  const xHex = publicKey.getX().toString('hex').padStart(64, '0')
  const yHex = publicKey.getY().toString('hex').padStart(64, '0')

  return `04${xHex}${yHex}`
}

export const generateAddress = (publicKey: Buffer) =>
  byteArray2hexStr(computeAddress(hexStr2byteArray(generatePubKey(publicKey))))

export const isBase58 = (value: string): boolean => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value)

export const isHex = (hex: string): boolean => /^(-0x|0x)?[0-9a-f]*$/i.test(hex)
