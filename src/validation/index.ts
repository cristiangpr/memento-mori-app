import { Dispatch, SetStateAction } from 'react'
import { UseFormSetError } from 'react-hook-form'
import { FormTypes } from '../types'

export const validateFieldsSum = (data: FormTypes, setError: UseFormSetError<FormTypes>): boolean => {
  let nativeSum = 0
  for (let i = 0; i < data.nativeToken[0].beneficiaries.length; i += 1) {
    nativeSum += Number(data.nativeToken[0].beneficiaries[i].percentage)
  }
  if (nativeSum !== 100) {
    setError(`nativeToken.${0}.beneficiaries`, {
      type: 'manual',
      message: 'Field values must add up to 100.',
    })
    return false
  }

  for (let i = 0; i < data.tokens.length; i += 1) {
    let tokenSum = 0
    for (let j = 0; j < data.tokens[i].beneficiaries.length; j += 1) {
      tokenSum += Number(data.tokens[i].beneficiaries[j].percentage)
    }
    if (tokenSum !== 100) {
      setError(`tokens.${i}.beneficiaries`, {
        type: 'manual',
        message: 'Field values must add up to 100.',
      })

      return false
    }
  }
  for (let i = 0; i < data.erc1155s.length; i += 1) {
    let erc1155Sum = 0
    for (let j = 0; j < data.erc1155s[i].beneficiaries.length; j += 1) {
      erc1155Sum += Number(data.erc1155s[i].beneficiaries[j].percentage)
    }
    if (erc1155Sum !== 100) {
      setError(`erc1155s.${i}.beneficiaries`, {
        type: 'manual',
        message: 'Field values must add up to 100.',
      })
      return false
    }
  }

  return true
}

export const validateDuplicates = (data: FormTypes, setError: UseFormSetError<FormTypes>): boolean => {
  for (let i = 0; i < data.nativeToken[0].beneficiaries.length; i += 1) {
    for (let j = i + 1; j < data.nativeToken[0].beneficiaries.length; j += 1) {
      if (data.nativeToken[0].beneficiaries[i].address === data.nativeToken[0].beneficiaries[j].address) {
        setError(`nativeToken.${i}`, {
          type: 'manual',
          message: 'Beneficiary addresses must be unique.',
        })
        return false
      }
    }
  }
  if (data.tokens.length > 0) {
    for (let i = 0; i < data.tokens.length; i += 1) {
      for (let j = i + 1; j < data.tokens.length; j += 1) {
        if (data.tokens[i].contractAddress === data.tokens[j].contractAddress) {
          setError(`tokens.${j}.contractAddress`, {
            type: 'manual',
            message: 'Token addresses must be unique.',
          })

          return false
        }
      }
    }

    for (let i = 0; i < data.tokens.length; i += 1) {
      for (let j = 0; j < data.tokens[i].beneficiaries.length; j += 1) {
        for (let k = j + 1; k < data.tokens[i].beneficiaries.length; k += 1) {
          if (data.tokens[i].beneficiaries[j].address === data.tokens[i].beneficiaries[k].address) {
            setError(`tokens.${i}`, {
              type: 'manual',
              message: 'Beneficiary addresses must be unique.',
            })

            return false
          }
        }
      }
    }
  }
  if (data.nfts.length > 0) {
    for (let i = 0; i < data.nfts.length; i += 1) {
      for (let j = i + 1; j < data.nfts.length; j += 1) {
        if (data.nfts[i].contractAddress === data.nfts[j].contractAddress) {
          setError(`nfts.${j}.contractAddress`, {
            type: 'manual',
            message: 'Token addresses must be unique.',
          })

          return false
        }
      }
    }
    for (let i = 0; i < data.nfts.length; i += 1) {
      for (let j = 0; j < data.nfts[i].beneficiaries.length; j += 1) {
        for (let k = j + 1; k < data.nfts[i].beneficiaries.length; k += 1) {
          if (data.nfts[i].beneficiaries[j].beneficiary === data.nfts[i].beneficiaries[k].beneficiary) {
            setError(`nfts.${i}.beneficiaries.${k}`, {
              type: 'manual',
              message: 'Beneficiary addresses must be unique.',
            })

            return false
          }
        }
      }
    }
  }
  if (data.erc1155s.length > 0) {
    for (let i = 0; i < data.erc1155s.length; i += 1) {
      for (let j = i + 1; j < data.erc1155s.length; j += 1) {
        if (data.erc1155s[i].contractAddress === data.erc1155s[j].contractAddress) {
          setError(`erc1155s.${j}.contractAddress`, {
            type: 'manual',
            message: 'Token addresses must be unique.',
          })

          return false
        }
      }
    }

    for (let i = 0; i < data.erc1155s.length; i += 1) {
      for (let j = 0; j < data.erc1155s[i].beneficiaries.length; j += 1) {
        for (let k = j + 1; k < data.erc1155s[i].beneficiaries.length; k += 1) {
          if (data.erc1155s[i].beneficiaries[j].address === data.erc1155s[i].beneficiaries[k].address) {
            setError(`erc1155s.${i}.beneficiaries.${k}`, {
              type: 'manual',
              message: 'Beneficiary addresses must be unique.',
            })

            return false
          }
        }
      }
    }
  }

  return true
}
