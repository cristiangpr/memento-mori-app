export enum CooldownPeriod {
  OneWeek = 10080000,
  TwoWeeks = 20160000,
  OneMonth = 43200000,
}

export type Beneficiary = {
  address: string
  percentage: number
}

export type NFTBeneficiary = {
  tokenId: number
  beneficiary: string
}

export type NFT = {
  contractAddress: string
  beneficiaries: NFTBeneficiary[]
}

export type Token = {
  contractAddress: string
  beneficiaries: Beneficiary[]
}

export type Erc1155 = {
  contractAddress: string
  tokenId: number
  beneficiaries: Beneficiary[]
}

export type NativeToken = {
  beneficiaries: Beneficiary[]
}

export type UserInfo = {
  firstName: string
  initial: string
  lastName: string
  birthDate?: string
  address?: string
}
export interface Forms {
  wills: FormTypes[]
}

export enum Form {
  IsActive = 'isActive',
  RequestTime = 'requestTime',
  Cooldown = 'cooldown',
  NativeToken = 'native',
  Tokens = 'tokens',
  NFTS = 'nfts',
  Erc1155s = 'erc1155s',
  Executors = 'executors',
  ChainSelector = 'chainSelector',
  Safe = 'safe',
  BaseAddress = 'baseAddress',
  XChainAddress = 'xChainAddress',
}

export interface FormTypes {
  [Form.IsActive]: boolean
  [Form.RequestTime]: string
  [Form.Cooldown]: string
  [Form.NativeToken]: NativeToken[]
  [Form.Erc1155s]: Erc1155[]
  [Form.Tokens]: Token[]
  [Form.NFTS]: NFT[]
  [Form.Executors]: string[]
  [Form.ChainSelector]: string
  [Form.Safe]: string
  [Form.BaseAddress]: string
  [Form.XChainAddress]: string
}

export type DisplayData = {
  isActive: boolean
  requestTime: number
  cooldown: number
  nativeToken: NativeToken
  tokens?: Token[]
  nfts?: NFT[]
  erc1155s?: Erc1155[]
  executors: string[]
}
