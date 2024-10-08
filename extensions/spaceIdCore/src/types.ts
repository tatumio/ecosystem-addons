export type CommonOptionalProps = {
  rpcUrl?: string
}

export type GetAddressOptionalProps = CommonOptionalProps & {
  coinType?: number
}

export type GetDomainNameOptionalProps = CommonOptionalProps & {
  multiple?: boolean
  queryChainIdList?: number[]
  queryTldList?: string[]
}
