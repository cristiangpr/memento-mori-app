/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import { Contract, Interface, ZeroAddress, ethers } from 'ethers'

import { BaseTransaction, SendTransactionsParams, SendTransactionsResponse } from '@safe-global/safe-apps-sdk'
import SafeAppsSDK from '@safe-global/safe-apps-sdk/dist/src/sdk'
import { parse } from 'path'
import Safe from '@safe-global/protocol-kit'
import ABI from './abis/mementoMori.json'
import { NFT, UserInfo, Token, Erc1155, NativeToken, FormTypes, DisplayData } from './types'
import { MM_ADDRESS } from './constants'

export const encodeTxData = (
  cooldown: number,
  native: NativeToken,
  tokens: Token[],
  nfts: NFT[],
  erc1155s: Erc1155[],
  executors: string[],
): string => {
  const dieSmartInterface = new Interface(ABI)
  return dieSmartInterface.encodeFunctionData('createWill', [cooldown, native, tokens, nfts, erc1155s, executors])
}

export const saveWill = async (wills: FormTypes[]): Promise<void> => {
  for (let i = 0; i < wills.length; i += 1) {
    const response = fetch('https://iwill-strapi.herokuapp.com/api/wills', {
      method: 'POST',
      headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: wills[i] }),
    })
  }
}

export const getUserInfo = async (address: string): Promise<UserInfo> => {
  const response = await fetch(
    `https://iwill-strapi.herokuapp.com/api/wills?filters[baseAddress][$eq]=${address}&paginationl[start]=0&pagination[limit]=10`,
    {
      method: 'GET',
      headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    },
  )
  return response.json()
}

export const formatData = (data: FormTypes, ownerAddress: string): FormTypes => {
  console.log('sub', data)
  const newData = JSON.parse(JSON.stringify(data))
  const executors = []
  const nativeBeneficiaries = []
  const nativePercentages = []
  for (let i = 0; i < newData.nativeToken[0].beneficiaries.length; i += 1) {
    nativeBeneficiaries.push(newData.nativeToken[0].beneficiaries[i].address)
    nativePercentages.push(Number(newData.nativeToken[0].beneficiaries[i].percentage))
    executors.push(newData.nativeToken[0].beneficiaries[i].address)
  }
  newData.nativeToken[0].beneficiaries = nativeBeneficiaries
  newData.nativeToken[0].percentages = nativePercentages
  if (!newData.tokens[0]) {
    newData.tokens = []
  }
  for (let i = 0; i < newData.tokens.length; i += 1) {
    const tokenBeneficiaries = []
    const tokenPercentages = []
    for (let j = 0; j < newData.tokens[i].beneficiaries.length; j += 1) {
      tokenBeneficiaries.push(newData.tokens[i].beneficiaries[j].address)
      tokenPercentages.push(newData.tokens[i].beneficiaries[j].percentage)
      executors.push(newData.tokens[i].beneficiaries[j].address)
    }
    newData.tokens[i].beneficiaries = tokenBeneficiaries

    newData.tokens[i].percentages = tokenPercentages
  }

  if (!newData.nfts[0]) {
    newData.nfts = []
  }
  for (let i = 0; i < newData.nfts.length; i += 1) {
    const nftBeneficiaries = []
    const nftIds = []
    for (let j = 0; j < newData.nfts[i].beneficiaries.length; j += 1) {
      nftBeneficiaries.push(newData.nfts[i].beneficiaries[j].beneficiary)
      executors.push(newData.nfts[i].beneficiaries[j].beneficiary)

      nftIds.push(newData.nfts[i].beneficiaries[j].tokenId)
    }
    newData.nfts[i].beneficiaries = nftBeneficiaries

    newData.nfts[i].tokenIds = nftIds
  }
  if (!newData.erc1155s[0]) {
    newData.erc1155s = []
  }
  for (let i = 0; i < newData.erc1155s.length; i += 1) {
    const erc1155Beneficiaries = []
    const erc1155Percentages = []
    for (let j = 0; j < newData.erc1155s[i].beneficiaries.length; j += 1) {
      erc1155Beneficiaries.push(newData.erc1155s[i].beneficiaries[j].address)
      erc1155Percentages.push(newData.erc1155s[i].beneficiaries[j].percentage)
      executors.push(newData.erc1155s[i].beneficiaries[j].address)
    }
    newData.erc1155s[i].beneficiaries = erc1155Beneficiaries

    newData.erc1155s[i].percentages = erc1155Percentages
  }
  const uniqueExecutors = [...new Set(executors)]
  uniqueExecutors.push(ownerAddress)
  const filteredExecutors = uniqueExecutors.filter((address) => {
    return address !== ZeroAddress
  })
  newData.executors = filteredExecutors

  return newData
}

export const createWill = async (
  data: FormTypes,
  sdk: SafeAppsSDK,
  safe: { safeAddress: any; chainId?: number; threshold?: number; owners?: string[]; isReadOnly?: boolean },
): Promise<boolean> => {
  const txData = encodeTxData(data.cooldown, data.nativeToken[0], data.tokens, data.nfts, data.erc1155s, data.executors)
  const createWillTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '10000000',
    data: txData,
  }
  const params = { safeTxGas: 500000000 }
  const IisModuleEnabled: Interface = new Interface(['function isModuleEnabled(address module)'])
  const isModuleEnabledData: string = IisModuleEnabled.encodeFunctionData('isModuleEnabled', [MM_ADDRESS])
  const isModuleEnabledParams = {
    to: safe.safeAddress,
    data: isModuleEnabledData,
  }
  const isEnabledData: string = await sdk.eth.call([isModuleEnabledParams])
  const isEnabled = isEnabledData !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  if (isEnabled) {
    const safeCreateWillTransaction = await sdk.txs.send({
      txs: [createWillTransaction],
      params,
    })
  } else {
    const IenableModule: Interface = new Interface(['function enableModule(address module)'])

    const enableModuleData: string = IenableModule.encodeFunctionData('enableModule', [MM_ADDRESS])

    const safeEnableModuleTransactionData: BaseTransaction = {
      to: safe.safeAddress,
      value: '0',
      data: enableModuleData,
    }

    const safeCreateWillTransaction: SendTransactionsResponse = await sdk.txs.send({
      txs: [createWillTransaction, safeEnableModuleTransactionData],
      params,
    })
  }

  return true
}

export const getWill = async (address: string, sdk: SafeAppsSDK): Promise<DisplayData> => {
  const dieSmartInterface: Interface = new Interface(ABI)
  const getWillData: string = dieSmartInterface.encodeFunctionData('getWill', [address])

  const getWillTransaction = {
    to: MM_ADDRESS,
    data: getWillData,
  }
  const data = await sdk.eth.call([getWillTransaction])

  // eslint-disable-next-line prefer-const
  let { isActive, cooldown, requestTime, native, tokens, nfts, erc1155s, executors } =
    dieSmartInterface.decodeFunctionResult('getWill', data)[0]
  console.log('data', isActive, cooldown, requestTime, native, tokens, nfts, erc1155s, executors)
  const nativeBeneficiaries = []
  for (let i = 0; i < native[0].length; i += 1) {
    const nativeBeneficiary = { address: '', percentage: null }
    nativeBeneficiary.address = native[0][i]
    nativeBeneficiary.percentage = Number(native[1][i])
    nativeBeneficiaries.push(nativeBeneficiary)
  }
  const tokensArr = []
  if (tokens.length > 0) {
    for (let i = 0; i < tokens.length; i += 1) {
      const token = { contractAddress: '', beneficiaries: [] }

      token.contractAddress = tokens[i][0]
      for (let j = 0; j < tokens[i][1].length; j += 1) {
        const tokenBeneficiary = { address: '', percentage: null }

        tokenBeneficiary.address = tokens[i][1][j]
        tokenBeneficiary.percentage = Number(tokens[i][2][j])
        token.beneficiaries.push(tokenBeneficiary)
      }
      tokensArr.push(token)
    }
  }
  const nftsArr = []
  if (nfts.length > 0) {
    for (let i = 0; i < nfts.length; i += 1) {
      const nft = { contractAddress: '', beneficiaries: [] }
      const nftBeneficiary = { tokenId: null, beneficiary: '' }
      nft.contractAddress = nfts[i][0]
      for (let j = 0; j < nfts[i][1].length; j += 1) {
        nftBeneficiary.tokenId = Number(nfts[i][1][j])
        nftBeneficiary.beneficiary = nfts[i][2][j]
        nft.beneficiaries.push(nftBeneficiary)
      }
      nftsArr.push(nft)
    }
  }
  const erc1155sArr = []
  if (erc1155s.length > 0) {
    for (let i = 0; i < erc1155s.length; i += 1) {
      const erc1155 = { contractAddress: '', tokenId: null, beneficiaries: [] }

      erc1155.contractAddress = erc1155s[i][0]
      if (erc1155.contractAddress === ZeroAddress) break
      erc1155.tokenId = Number(erc1155s[i][1])
      for (let j = 0; j < erc1155s[i][2].length; j += 1) {
        const erc1155Beneficiary = { address: '', percentage: null }
        erc1155Beneficiary.address = erc1155s[i][2][j]
        erc1155Beneficiary.percentage = Number(erc1155s[i][3][j])
        erc1155.beneficiaries.push(erc1155Beneficiary)
      }
      erc1155sArr.push(erc1155)
    }
  }
  cooldown = Number(cooldown)
  requestTime = Number(requestTime)
  return {
    isActive,
    cooldown,
    requestTime,
    nativeToken: { beneficiaries: nativeBeneficiaries },
    tokens: tokensArr,
    nfts: nftsArr,
    erc1155s: erc1155sArr,
    executors,
  }
}

export const executeWill = async (sdk: SafeAppsSDK, ownerAddress: string): Promise<void> => {
  const mmInterface: Interface = new Interface(ABI)
  const executeData: string = mmInterface.encodeFunctionData('execute', [ownerAddress, 50000000000])
  const executeWillTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: executeData,
  }

  await sdk.txs.send({
    txs: [executeWillTransaction],
  })
}

export const executeWillByOwner = async (sdk: SafeAppsSDK, ownerAddress: any): Promise<void> => {
  const mmInterface: Interface = new Interface(ABI)
  const executeData: string = mmInterface.encodeFunctionData('execute', [ownerAddress, 500000000])
  const executeWillTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: executeData,
  }
  const requestData: string = mmInterface.encodeFunctionData('requestExecution', [ownerAddress])
  const requestTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: requestData,
  }
  const params = { safeTxGas: 500000000 }
  await sdk.txs.send({
    txs: [executeWillTransaction],
  })
}

export const deleteWill = async (sdk: SafeAppsSDK): Promise<void> => {
  const mmInterface = new Interface(ABI)
  const executeData = mmInterface.encodeFunctionData('deleteWill')
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

export const requestExecution = async (owner: string, sdk: SafeAppsSDK): Promise<void> => {
  const mmInterface: Interface = new Interface(ABI)
  const requestData: string = mmInterface.encodeFunctionData('requestExecution', [owner])
  const requestTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: requestData,
  }
  await sdk.txs.send({
    txs: [requestTransaction],
  })
}

export const cancelExecution = async (sdk: SafeAppsSDK): Promise<void> => {
  const mmInterface = new Interface(ABI)
  const cancelData: string = mmInterface.encodeFunctionData('cancelExecution')
  const cancelTransaction: BaseTransaction = {
    to: MM_ADDRESS,
    value: '0',
    data: cancelData,
  }
  await sdk.txs.send({
    txs: [cancelTransaction],
  })
}

export const getIsExecutor = (
  data: DisplayData,
  safe: { safeAddress: any; chainId?: number; threshold?: number; owners: any; isReadOnly?: boolean },
): boolean => {
  for (let i = 0; i < data.executors.length; i += 1) {
    for (let j = 0; j < safe.owners.length; j += 1) {
      if (safe.safeAddress === data.executors[i] || safe.owners[j] === data.executors[i]) {
        return true
      }
    }
  }
  return false
}
export const getExecTime = (data: DisplayData): number => {
  return Number(data.requestTime) + Number(data.cooldown)
}
