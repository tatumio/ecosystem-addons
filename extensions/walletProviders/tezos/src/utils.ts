import BigNumber from 'bignumber.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const castToBigNumber = (data: any, keys?: any): any => {
  const returnArray: boolean = Array.isArray(data)
  if (typeof keys === 'undefined') {
    keys = Object.keys(data)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = returnArray ? [] : {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keys.forEach((key: any) => {
    const item = data[key]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let res: any
    if (typeof item === 'undefined') {
      return
    }

    if (Array.isArray(item)) {
      res = castToBigNumber(item)
      response[key] = res
      return
    }

    res = new BigNumber(item)
    response[key] = res
  })

  return response
}
