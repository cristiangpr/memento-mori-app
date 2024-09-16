/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */

import { Contract, Interface, ZeroAddress, ethers } from 'ethers'

import { BaseTransaction, SendTransactionsParams, SendTransactionsResponse } from '@safe-global/safe-apps-sdk'
import SafeAppsSDK from '@safe-global/safe-apps-sdk/dist/src/sdk'

import ABI from '../abis/mementoMori.json'
import {
  NFT,
  UserInfo,
  Token,
  Erc1155,
  NativeToken,
  FormTypes,
  Forms,
  Form,
  ContractWill,
  TransactionType,
} from '../types'
import { devUrl, prodUrl, sepoliaMmAddress } from '../constants'
import { request } from '../api'

export const saveWills = async (data: FormTypes[]): Promise<void> => {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].id) {
      console.log('update', data)
      await request({
        url: `/wills/${data[i].id}`,
        method: 'PUT',
        data: { data: data[i] },
      })
    } else {
      await request({
        url: `/wills`,
        method: 'POST',
        data: { data: data[i] },
      })
    }
  }
}

export const saveWillHash = async (
  wills: ContractWill[],
  sdk: SafeAppsSDK,
  safe: { safeAddress: string; chainId?: number; threshold?: number; owners?: string[]; isReadOnly?: boolean },
  transactionType: TransactionType,
): Promise<void> => {
  const IMementoMori = new Interface(ABI)
  const data = IMementoMori.encodeFunctionData('saveWillHash', [wills, transactionType])
  const safeSaveWillHashTransaction: BaseTransaction = {
    to: sepoliaMmAddress,
    value: '10000000',
    data,
  }
  const params = { safeTxGas: 500000000 }
  const IisModuleEnabled: Interface = new Interface(['function isModuleEnabled(address module)'])
  const isModuleEnabledData: string = IisModuleEnabled.encodeFunctionData('isModuleEnabled', [sepoliaMmAddress])
  const isModuleEnabledParams = {
    to: safe.safeAddress,
    data: isModuleEnabledData,
  }
  const isEnabledData: string = await sdk.eth.call([isModuleEnabledParams])
  const isEnabled = isEnabledData !== '0x0000000000000000000000000000000000000000000000000000000000000000'

  if (isEnabled) {
    const safeCreateWillTransaction = await sdk.txs.send({
      txs: [safeSaveWillHashTransaction],
      params,
    })
  } else {
    const IenableModule: Interface = new Interface(['function enableModule(address module)'])

    const enableModuleData: string = IenableModule.encodeFunctionData('enableModule', [sepoliaMmAddress])

    const safeEnableModuleTransactionData: BaseTransaction = {
      to: safe.safeAddress,
      value: '0',
      data: enableModuleData,
    }

    const safeSaveWillHaswwhTransaction: SendTransactionsResponse = await sdk.txs.send({
      txs: [safeSaveWillHashTransaction, safeEnableModuleTransactionData],
      params,
    })
  }
}

const formatAssetData = (assets: NativeToken[] | Token[] | NFT[] | Erc1155[], isNFT = false) => {
  return assets.map((asset) => {
    const beneficiaries = asset.beneficiaries.map((b) => b.address)
    const values = asset.beneficiaries.map((b) => (isNFT ? b.tokenId : b.percentage))
    return {
      ...asset,
      beneficiaries,
      [isNFT ? 'tokenIds' : 'percentages']: values,
    }
  })
}
export const formatDataForApi = (data: FormTypes, ownerAddress: string): FormTypes => {
  const newData = structuredClone(data)

  const allBeneficiaries = [
    ...newData.native[0].beneficiaries,
    ...newData.tokens.flatMap((t) => t.beneficiaries),
    ...newData.nfts.flatMap((n) => n.beneficiaries),
    ...newData.erc1155s.flatMap((e) => e.beneficiaries),
  ]

  newData.native[0] = formatAssetData(newData.native)[0]
  newData.tokens = formatAssetData(newData.tokens)
  newData.nfts = formatAssetData(newData.nfts, true)
  newData.erc1155s = formatAssetData(newData.erc1155s)

  const uniqueExecutors = new Set(allBeneficiaries.map((b) => b.address))
  uniqueExecutors.add(ownerAddress)
  newData.executors = Array.from(uniqueExecutors).filter((address) => address !== ZeroAddress)

  return newData
}

export const formatDataForContract = (data: FormTypes, ownerAddress: string, requestTime?: string): ContractWill => {
  const newData = structuredClone(data)

  const allBeneficiaries = [
    ...newData.native[0].beneficiaries,
    ...newData.tokens.flatMap((t) => t.beneficiaries),
    ...newData.nfts.flatMap((n) => n.beneficiaries),
    ...newData.erc1155s.flatMap((e) => e.beneficiaries),
  ]

  newData.native[0] = formatAssetData(newData.native)[0]
  newData.tokens = formatAssetData(newData.tokens)
  newData.nfts = formatAssetData(newData.nfts, true)
  newData.erc1155s = formatAssetData(newData.erc1155s)

  const uniqueExecutors = new Set(allBeneficiaries.map((b) => b.address))
  uniqueExecutors.add(ownerAddress)
  newData.executors = Array.from(uniqueExecutors).filter((address) => address !== ZeroAddress)

  delete newData.executed
  delete newData.id

  newData.isActive = !!requestTime && requestTime !== '0'
  newData.requestTime = requestTime || '0'

  return newData as ContractWill
}
const formatBeneficiaries = (beneficiaries, values, isNFT = false) =>
  beneficiaries.map((address, i) => ({
    address,
    [isNFT ? 'tokenId' : 'percentage']: values[i],
  }))

const formatAssets = (assets, isNFT = false) =>
  assets.map((asset) => ({
    contractAddress: asset.contractAddress,
    name: asset.name,
    beneficiaries: formatBeneficiaries(asset.beneficiaries, isNFT ? asset.tokenIds : asset.percentages, isNFT),
  }))
export const getDisplayData = (data: any[]): FormTypes[] => {
  return data.map(({ attributes, id }) => {
    const {
      isActive,
      cooldown,
      requestTime,
      native,
      tokens,
      nfts,
      erc1155s,
      executors,
      baseAddress,
      chainSelector,
      xChainAddress,
      safe,
      executed,
    } = attributes

    return {
      id,
      isActive,
      cooldown,
      requestTime,
      executors,
      baseAddress,
      chainSelector,
      xChainAddress,
      safe,
      executed,
      native: [
        {
          beneficiaries: formatBeneficiaries(native[0].beneficiaries, native[0].percentages),
        },
      ],
      tokens: formatAssets(tokens),
      nfts: formatAssets(nfts, true),
      erc1155s: formatAssets(erc1155s),
    }
  })
}

export const executeWill = async (sdk: SafeAppsSDK, wills: FormTypes[]): Promise<string> => {
  const mmInterface: Interface = new Interface(ABI)
  const executeData: string = mmInterface.encodeFunctionData('execute', [wills])
  const executeWillTransaction: BaseTransaction = {
    to: sepoliaMmAddress,
    value: '0',
    data: executeData,
  }

  const response = await sdk.txs.send({
    txs: [executeWillTransaction],
    params: { safeTxGas: 500000000 },
  })
  const hash = response.safeTxHash
  return hash
}

export const deleteWillHash = async (sdk: SafeAppsSDK): Promise<void> => {
  const mmInterface = new Interface(ABI)
  const deleteData = mmInterface.encodeFunctionData('deleteWill')
  const deleteWillTransaction: BaseTransaction = {
    to: sepoliaMmAddress,
    value: '0',
    data: deleteData,
  }
  const params = { safeTxGas: 500000000 }
  await sdk.txs.send({
    txs: [deleteWillTransaction],
  })
}

export const requestExecution = async (wills: ContractWill[], sdk: SafeAppsSDK): Promise<void> => {
  const mmInterface = new Interface(ABI)
  const requestData = mmInterface.encodeFunctionData('requestExecution', [wills])
  const requestTransaction: BaseTransaction = {
    to: sepoliaMmAddress,
    value: '0',
    data: requestData,
  }
  const params = { safeTxGas: 500000000 }
  await sdk.txs.send({
    txs: [requestTransaction],
  })
}

export const getIsExecutor = (
  data: FormTypes,
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
export const getExecTime = (data: FormTypes): number => {
  return Number(data.requestTime) + Number(data.cooldown)
}
