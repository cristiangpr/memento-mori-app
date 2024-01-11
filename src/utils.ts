/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-const */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import { Contract, Interface, ZeroAddress, ethers } from 'ethers'

import { BaseTransaction, SendTransactionsParams, SendTransactionsResponse } from '@safe-global/safe-apps-sdk'
import SafeAppsSDK from '@safe-global/safe-apps-sdk/dist/src/sdk'
import { parse, sep } from 'path'
import Safe from '@safe-global/protocol-kit'
import ABI from './abis/mementoMori.json'
import { NFT, UserInfo, Token, Erc1155, NativeToken, FormTypes, Forms, Form, ContractWill } from './types'
import { prodUrl, sepoliaMmAddress } from './constants'

export const saveWill = async (data: FormTypes[]): Promise<void> => {
  for (let i = 0; i < data.length; i += 1) {
    const res = await fetch(
      `${prodUrl}?filters[baseAddress][$eq]=${data[i].baseAddress}&filters[chainSelector][$eq]=${data[i].chainSelector}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
      },
    )
    const check = await res.json()
    console.log(check)
    if (check.data.length > 0) {
      fetch(`${prodUrl}/${check.data[0].id}`, {
        method: 'PUT',
        headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data[i] }),
      })
    } else {
      fetch(prodUrl, {
        method: 'POST',
        headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data[i] }),
      })
    }
  }
}
export const saveWillHash = async (
  wills: ContractWill[],
  sdk: SafeAppsSDK,
  safe: { safeAddress: any; chainId?: number; threshold?: number; owners?: string[]; isReadOnly?: boolean },
): Promise<void> => {
  console.log('hash', wills)
  const IMementoMori = new Interface(ABI)
  const data = IMementoMori.encodeFunctionData('saveWillHash', [wills])
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

export const getWills = async (address: string): Promise<any[]> => {
  const response = await fetch(`${prodUrl}?filters[baseAddress][$eq]=${address}&sort=id`, {
    method: 'GET',
    headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
  })
  const result = await response.json()
  return result.data
}

export const formatDataForApi = (data: FormTypes, ownerAddress: string): FormTypes => {
  const newData = JSON.parse(JSON.stringify(data))
  const executors = []
  const nativeBeneficiaries = []
  const nativePercentages = []
  for (let i = 0; i < newData.native[0].beneficiaries.length; i += 1) {
    nativeBeneficiaries.push(newData.native[0].beneficiaries[i].address)
    nativePercentages.push(newData.native[0].beneficiaries[i].percentage)
    executors.push(newData.native[0].beneficiaries[i].address)
  }
  newData.native[0].beneficiaries = nativeBeneficiaries
  newData.native[0].percentages = nativePercentages
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

export const formatDataForContract = (data: FormTypes, ownerAddress: string): ContractWill => {
  const newData = JSON.parse(JSON.stringify(data))
  const executors = []
  const nativeBeneficiaries = []
  const nativePercentages = []
  for (let i = 0; i < newData.native[0].beneficiaries.length; i += 1) {
    nativeBeneficiaries.push(newData.native[0].beneficiaries[i].address)
    nativePercentages.push(newData.native[0].beneficiaries[i].percentage)
    executors.push(newData.native[0].beneficiaries[i].address)
  }
  newData.native[0].beneficiaries = nativeBeneficiaries
  newData.native[0].percentages = nativePercentages
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
  delete newData.executed
  delete newData.id

  return newData
}

export const getDisplayData = (data: any[]): FormTypes[] => {
  const result = []
  for (let h = 0; h < data.length; h += 1) {
    let {
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
    } = data[h].attributes
    const id = data[h]

    const nativeBeneficiaries = []
    for (let i = 0; i < native[0].beneficiaries.length; i += 1) {
      const nativeBeneficiary = { address: '', percentage: null }
      nativeBeneficiary.address = native[0].beneficiaries[i]
      nativeBeneficiary.percentage = native[0].percentages[i]
      nativeBeneficiaries.push(nativeBeneficiary)
    }
    const tokensArr = []
    if (tokens.length > 0) {
      for (let i = 0; i < tokens.length; i += 1) {
        const token = { contractAddress: '', beneficiaries: [] }

        token.contractAddress = tokens[i].contractAddress
        for (let j = 0; j < tokens[i].beneficiaries.length; j += 1) {
          const tokenBeneficiary = { address: '', percentage: null }

          tokenBeneficiary.address = tokens[i].beneficiaries[j]
          tokenBeneficiary.percentage = tokens[i].percentages[j]
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
        nft.contractAddress = nfts[i].contractAddress
        for (let j = 0; j < nfts[i][1].length; j += 1) {
          nftBeneficiary.tokenId = nfts[i].tokenIds[j]
          nftBeneficiary.beneficiary = nfts[i].beneficiaries[j]
          nft.beneficiaries.push(nftBeneficiary)
        }
        nftsArr.push(nft)
      }
    }
    const erc1155sArr = []
    if (erc1155s.length > 0) {
      for (let i = 0; i < erc1155s.length; i += 1) {
        const erc1155 = { contractAddress: '', tokenId: null, beneficiaries: [] }

        erc1155.contractAddress = erc1155s[i].contractAddress

        erc1155.tokenId = erc1155s[i].contractAddress
        for (let j = 0; j < erc1155s[i][2].length; j += 1) {
          const erc1155Beneficiary = { address: '', percentage: null }
          erc1155Beneficiary.address = erc1155s[i].beneficiaries[j]
          erc1155Beneficiary.percentage = erc1155s[i].percentages[j]
          erc1155.beneficiaries.push(erc1155Beneficiary)
        }
        erc1155sArr.push(erc1155)
      }
    }
    const will = {
      isActive,
      cooldown,
      requestTime,
      id,
      tokens: tokensArr,
      nfts: nftsArr,
      erc1155s: erc1155sArr,
      executors,
      baseAddress,
      chainSelector,
      xChainAddress,
      safe,
      native: [{ beneficiaries: nativeBeneficiaries }],
      executed,
    }
    result.push(will)
  }
  return result
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
// TODO: implement in contract
export const deleteWill = async (data: FormTypes[], sdk: SafeAppsSDK, safe): Promise<void> => {
  for (let i = 0; i < data.length; i += 1) {
    const res = await fetch(
      `${prodUrl}?filters[baseAddress][$eq]=${safe.safeAddress}}&filters[chainSelector][$eq]=${data[i].chainSelector}`,
      {
        method: 'GET',
        headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
      },
    )
    const check = await res.json()
    fetch(`${prodUrl}/${check.id}`, {
      method: 'DELETE',
      headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
    })
  }
  const mmInterface = new Interface(ABI)
  const executeData = mmInterface.encodeFunctionData('deleteWill', [safe.safeAddress])
  const executeWillTransaction: BaseTransaction = {
    to: sepoliaMmAddress,
    value: '0',
    data: executeData,
  }
  const params = { safeTxGas: 500000000 }
  await sdk.txs.send({
    txs: [executeWillTransaction],
  })
}

export const requestExecution = async (owner: string, safe): Promise<boolean> => {
  const response = await fetch(`${prodUrl}?filters[baseAddress][$eq]=${owner}&sort=id`, {
    method: 'GET',
    headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
  })
  const result = await response.json()
  if (result.data.length > 0) {
    for (let i = 0; i < result.data[0].attributes.executors.length; i += 1) {
      if (result.data[0].attributes.executors[i] === safe.safeAddress) {
        fetch(`${prodUrl}/${result.data[0].id}`, {
          method: 'PUT',
          headers: {
            Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { isActive: true, requestTime: Math.floor(Date.now() / 1000).toString() } }),
        })
        return true
      }
    }
  }
  return false
}

export const cancelExecution = async (safe): Promise<boolean> => {
  const response = await fetch(`${prodUrl}?filters[baseAddress][$eq]=${safe}&sort=id`, {
    method: 'GET',
    headers: { Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`, 'Content-Type': 'application/json' },
  })
  const result = await response.json()
  if (result.data.length > 0) {
    if (result.data[0].attributes.baseAddress === safe.safeAddress) {
      fetch(`${prodUrl}/${result.data[0].id}`, {
        method: 'PUT',
        headers: {
          Authorization: `bearer ${process.env.REACT_APP_STRAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { isActive: false } }),
      })
      return true
    }
  }
  return false
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
