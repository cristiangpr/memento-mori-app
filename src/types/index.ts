export enum CooldownPeriod {
  OneWeek = 10080000,
  TwoWeeks = 20160000,
  OneMonth = 43200000,
}
export enum TransactionType {
  Create,
  Update,
  Cancel,
  Request,
  Execute,
  Delete,
}
export enum TransactionStatus {
  Confirm,
  Executing,
  Success,
  Failure,
}

export type Beneficiary = {
  address: string
  percentage: number
}

export type NFTBeneficiary = {
  tokenId: number
  address: string
}

export type NFT = {
  contractAddress: string
  beneficiaries: NFTBeneficiary[]
  name?: string
}

export type Token = {
  contractAddress: string
  beneficiaries: Beneficiary[]
  name?: string
}

export type Erc1155 = {
  contractAddress: string
  tokenId: number
  beneficiaries: Beneficiary[]
  name?: string
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
  Native = 'native',
  Tokens = 'tokens',
  NFTS = 'nfts',
  Erc1155s = 'erc1155s',
  Executors = 'executors',
  ChainSelector = 'chainSelector',
  Safe = 'safe',
  BaseAddress = 'baseAddress',
  XChainAddress = 'xChainAddress',
  Executed = 'executed',
  Id = 'id',
}

export interface FormTypes {
  [Form.IsActive]: boolean
  [Form.RequestTime]: string
  [Form.Cooldown]: string
  [Form.Native]: NativeToken[]
  [Form.Erc1155s]: Erc1155[]
  [Form.Tokens]: Token[]
  [Form.NFTS]: NFT[]
  [Form.Executors]: string[]
  [Form.ChainSelector]: string
  [Form.Safe]: string
  [Form.BaseAddress]: string
  [Form.XChainAddress]: string
  [Form.Executed]: boolean
  [Form.Id]?: number
}

export type ContractWill = {
  isActive: boolean
  requestTime: string
  cooldown: string
  native: NativeToken[]
  tokens: Token[]
  nfts: NFT[]
  erc1155s: Erc1155[]
  executors: string[]
  chainSelector: string
  safe: string
  xChainAddress: string
  baseAddress: string
}
export enum TokenType {
  Native = 'native',
  Token = 'tokens',
  Nft = 'nfts',
  Erc1155 = 'erc1155s',
}
