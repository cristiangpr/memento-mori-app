/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import { Contract, Interface, ZeroAddress, ethers } from 'ethers'

import { BaseTransaction, SendTransactionsParams } from '@safe-global/safe-apps-sdk'
import SafeAppsSDK from '@safe-global/safe-apps-sdk/dist/src/sdk'
import { parse } from 'path'
import ABI from './abis/dieSmart.json'
import { NFT, UserInfo, Token, Erc1155, NativeToken, FormTypes, DisplayData } from './types'

const MM_ADDRESS = '0x23f13137BbFd6BFa57dAfD66793E9c8Db17C085C'

export function encodeTxData(native: NativeToken, tokens: Token[], nfts: NFT[], erc1155s: Erc1155[]): string {
  const dieSmartInterface = new Interface(ABI)
  return dieSmartInterface.encodeFunctionData('createWill', [native, tokens, nfts, erc1155s])
}

export async function saveWill(postData: UserInfo) {
  console.log('token', process.env.REACT_APP_STRAPI_TOKEN)
  const response = await fetch('https://iwill-strapi.herokuapp.com/api/wills', {
    method: 'POST',
    headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: postData }),
  })
}

export async function getUserInfo(address: string) {
  console.log('token', process.env.REACT_APP_STRAPI_TOKEN)
  const response = await fetch(
    `https://iwill-strapi.herokuapp.com/api/wills?filters[address][$eq]=${address}&paginationl[start]=0&pagination[limit]=1`,
    {
      method: 'GET',
      headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    },
  )
  return response.json()
}

export function formatData(data) {
  const newData = JSON.parse(JSON.stringify(data))
  const nativeBeneficiaries = []
  const nativePercentages = []
  for (let i = 0; i < newData.nativeToken[0].beneficiaries.length; i += 1) {
    nativeBeneficiaries.push(newData.nativeToken[0].beneficiaries[i].address)
    nativePercentages.push(Number(newData.nativeToken[0].beneficiaries[i].percentage))
  }
  newData.nativeToken[0].beneficiaries = nativeBeneficiaries
  newData.nativeToken[0].percentages = nativePercentages
  if (!newData.tokens[0]) {
    newData.tokens[0] = { contractAddress: ZeroAddress, beneficiaries: [{ address: ZeroAddress, percentage: 0 }] }
  }
  for (let i = 0; i < newData.tokens.length; i += 1) {
    const tokenBeneficiaries = []
    const tokenPercentages = []
    for (let j = 0; j < newData.tokens[i].beneficiaries.length; j += 1) {
      tokenBeneficiaries.push(newData.tokens[i].beneficiaries[j].address)
      tokenPercentages.push(newData.tokens[i].beneficiaries[j].percentage)
    }
    newData.tokens[i].beneficiaries = tokenBeneficiaries

    newData.tokens[i].percentages = tokenPercentages
  }

  if (!newData.nfts[0]) {
    newData.nfts[0] = {
      contractAddress: ZeroAddress,
      beneficiaries: [{ tokenId: 0, beneficiary: ZeroAddress }],
    }
  }
  for (let i = 0; i < newData.nfts.length; i += 1) {
    const nftBeneficiaries = []
    const nftIds = []
    for (let j = 0; j < newData.nfts[i].beneficiaries.length; j += 1) {
      nftBeneficiaries.push(newData.nfts[i].beneficiaries[j].beneficiary)

      nftIds.push(newData.nfts[i].beneficiaries[j].tokenId)
    }
    newData.nfts[i].beneficiaries = nftBeneficiaries

    newData.nfts[i].tokenIds = nftIds
  }
  if (!newData.erc1155s[0]) {
    newData.erc1155s[0] = {
      contractAddress: ZeroAddress,
      tokenId: 0,
      beneficiaries: [{ address: ZeroAddress, percentage: 0 }],
    }
  }
  for (let i = 0; i < newData.erc1155s.length; i += 1) {
    const erc1155Beneficiaries = []
    const erc1155Percentages = []
    for (let j = 0; j < newData.erc1155s[i].beneficiaries.length; j += 1) {
      erc1155Beneficiaries.push(newData.erc1155s[i].beneficiaries[j].address)
      erc1155Percentages.push(newData.erc1155s[i].beneficiaries[j].percentage)
    }
    newData.erc1155s[i].beneficiaries = erc1155Beneficiaries

    newData.erc1155s[i].percentages = erc1155Percentages
  }
  return newData
}

export async function createWill(data: FormTypes, sdk, safe) {
  const txData = encodeTxData(data.nativeToken[0], data.tokens, data.nfts, data.erc1155s)
  const createWillTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '10000000',
    data: txData,
  }
  const params = { safeTxGas: 500000000 }
  const IisModuleEnabled = new Interface(['function isModuleEnabled(address module)'])
  const isModuleEnabledData = IisModuleEnabled.encodeFunctionData('isModuleEnabled', [MM_ADDRESS])
  const isModuleEnabledParams = {
    to: safe.safeAddress,
    data: isModuleEnabledData,
  }
  const isEnabledData = await sdk.eth.call([isModuleEnabledParams])
  console.log(isEnabledData)
  const isEnabled = isEnabledData !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  console.log(isEnabled)
  if (isEnabled) {
    const safeCreateWillTransaction = await sdk.txs.send({
      txs: [createWillTransaction],
      params,
    })
  } else {
    const IenableModule = new Interface(['function enableModule(address module)'])

    const enableModuleData = IenableModule.encodeFunctionData('enableModule', [MM_ADDRESS])

    const safeEnableModuleTransactionData: BaseTransaction = {
      to: safe.safeAddress,
      value: '0',
      data: enableModuleData,
    }

    const safeCreateWillTransaction = await sdk.txs.send({
      txs: [createWillTransaction, safeEnableModuleTransactionData],
      params,
    })
  }

  const postData = {
    firstName: data.firstName,
    initial: data.initial,
    lastName: data.lastName,
    birthDate: data.birthDate,
    address: safe.safeAddress,
  }
  const res = await saveWill(postData)
  console.log(res)
}

export const getWill = async (safe, sdk: SafeAppsSDK): Promise<DisplayData> => {
  const dieSmartInterface = new Interface(ABI)
  const getWillData = dieSmartInterface.encodeFunctionData('getWill', [safe.safeAddress])

  const getWillTransaction = {
    to: MM_ADDRESS,
    data: getWillData,
  }
  const data = await sdk.eth.call([getWillTransaction])
  const { native, tokens, nfts, erc1155s } = dieSmartInterface.decodeFunctionResult('getWill', data)[0]
  const response = await getUserInfo(safe.safeAddress)
  const userInfo = response.data[0].attributes
  console.log('tokens', tokens)
  const nativeBeneficiaries = []
  for (let i = 0; i < native[0].length; i += 1) {
    const nativeBeneficiary = { address: '', percentage: null }
    nativeBeneficiary.address = native[0][i]
    nativeBeneficiary.percentage = native[1][i]
    nativeBeneficiaries.push(nativeBeneficiary)
  }
  const tokensArr = []
  for (let i = 0; i < tokens.length; i += 1) {
    const token = { contractAddress: '', beneficiaries: [] }

    token.contractAddress = tokens[i][0]
    if (token.contractAddress === ZeroAddress) break
    for (let j = 0; j < tokens[i][1].length; j += 1) {
      const tokenBeneficiary = { address: '', percentage: null }
      console.log(tokens[i][1][j])
      tokenBeneficiary.address = tokens[i][1][j]
      tokenBeneficiary.percentage = tokens[i][2][j]
      token.beneficiaries.push(tokenBeneficiary)
    }
    if (token.contractAddress !== ZeroAddress) tokensArr.push(token)
  }
  console.log('tarr', tokensArr)
  const nftsArr = []
  for (let i = 0; i < nfts.length; i += 1) {
    const nft = { contractAddress: '', beneficiaries: [] }
    const nftBeneficiary = { tokenId: null, beneficiary: '' }
    nft.contractAddress = nfts[i][0]
    if (nft.contractAddress === ZeroAddress) break
    for (let j = 0; j < nfts[i][1].length; j += 1) {
      nftBeneficiary.tokenId = nfts[i][1][j]
      nftBeneficiary.beneficiary = nfts[i][2][j]
      nft.beneficiaries.push(nftBeneficiary)
    }
    if (nft.contractAddress !== ZeroAddress) nftsArr.push(nft)
  }

  const erc1155sArr = []
  for (let i = 0; i < erc1155s.length; i += 1) {
    const erc1155 = { contractAddress: '', tokenId: null, beneficiaries: [] }

    erc1155.contractAddress = erc1155s[i][0]
    if (erc1155.contractAddress === ZeroAddress) break
    erc1155.tokenId = erc1155s[i][1]
    for (let j = 0; j < erc1155s[i][2].length; j += 1) {
      const erc1155Beneficiary = { address: '', percentage: null }
      erc1155Beneficiary.address = erc1155s[i][2][j]
      erc1155Beneficiary.percentage = erc1155s[i][3][j]
      erc1155.beneficiaries.push(erc1155Beneficiary)
    }
    if (erc1155.contractAddress !== ZeroAddress) erc1155sArr.push(erc1155)
  }

  return {
    firstName: userInfo.firstName,
    initial: userInfo.initial,
    lastName: userInfo.lastName,
    birthDate: userInfo.birthDate,
    nativeToken: { beneficiaries: nativeBeneficiaries },
    tokens: tokensArr,
    nfts: nftsArr,
    erc1155s: erc1155sArr,
  }
}

export const executeWill = async (sdk, safe) => {
  const dieSmartInterface = new Interface(ABI)
  const executeData = dieSmartInterface.encodeFunctionData('execute', [safe.safeAddress, 500000000])
  const executeWillTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: executeData,
  }
  const params = { safeTxGas: 500000000 }
  await sdk.txs.send({
    txs: [executeWillTransaction],
  })
}
