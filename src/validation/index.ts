import { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import { getAddress } from 'ethers'
import { Forms, TokenType } from '../types'

const setFieldError = (
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: TokenType,
  assetIndex: number,
  beneficiaryIndex: number | null,
  field: string,
  message: string,
) => {
  const path = `wills.${willIndex}.${tokenType}.${assetIndex}${
    beneficiaryIndex !== null ? `.beneficiaries.${beneficiaryIndex}` : ''
  }.${field}` as FieldPath<Forms>
  setError(path, { type: 'manual', message })
}

export const validatePercentages = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: TokenType,
): boolean => {
  return data[tokenType].every((asset, assetIndex) => {
    const sum = asset.beneficiaries.reduce((acc, ben) => acc + Number(ben.percentage), 0)
    const isValid = sum === 100 && asset.beneficiaries.every((ben) => ben.percentage >= 1 && ben.percentage <= 100)

    if (!isValid) {
      asset.beneficiaries.forEach((_, benIndex) => {
        setFieldError(
          setError,
          willIndex,
          tokenType,
          assetIndex,
          benIndex,
          'percentage',
          sum !== 100 ? 'Field values must add up to 100.' : 'Value must be between 1 and 100',
        )
      })
    }

    return isValid
  })
}

export const validateDuplicates = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: TokenType,
): boolean => {
  const addressSet = new Set()
  let isValid = true

  data[tokenType].forEach((asset, assetIndex) => {
    if (tokenType !== 'native' && addressSet.has(asset.contractAddress)) {
      setFieldError(
        setError,
        willIndex,
        tokenType,
        assetIndex,
        null,
        'contractAddress',
        'Token addresses must be unique.',
      )
      isValid = false
    }
    addressSet.add(asset.contractAddress)

    const beneficiarySet = new Set()
    asset.beneficiaries.forEach((ben, benIndex) => {
      if (beneficiarySet.has(ben.address)) {
        setFieldError(
          setError,
          willIndex,
          tokenType,
          assetIndex,
          benIndex,
          'address',
          'Beneficiary addresses must be unique.',
        )
        isValid = false
      }
      beneficiarySet.add(ben.address)
    })
  })

  return isValid
}

export const validateAddresses = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: TokenType,
): boolean => {
  let isValid = true

  data[tokenType].forEach((asset, assetIndex) => {
    if (tokenType !== 'native') {
      try {
        getAddress(asset.contractAddress)
      } catch {
        setFieldError(
          setError,
          willIndex,
          tokenType,
          assetIndex,
          null,
          'contractAddress',
          'Please enter a valid address',
        )
        isValid = false
      }
    }

    asset.beneficiaries.forEach((ben, benIndex) => {
      try {
        getAddress(ben.address)
      } catch {
        setFieldError(setError, willIndex, tokenType, assetIndex, benIndex, 'address', 'Please enter a valid address')
        isValid = false
      }
    })
  })

  return isValid
}
