import { Dispatch, SetStateAction } from 'react'
import { FieldValues, UseFormSetError } from 'react-hook-form'
import { getAddress } from 'ethers'
import { TokenType } from '@safe-global/safe-apps-sdk'
import { Erc1155, FormTypes, Forms, NFT, NativeToken, Token } from '../types'

export const validatePercentages = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,

  tokenType: 'native' | 'tokens' | 'erc1155s',
): boolean => {
  console.log(data)
  for (let i = 0; i < data[tokenType].length; i += 1) {
    let sum = 0
    for (let j = 0; j < data[tokenType][i].beneficiaries.length; j += 1) {
      if (data[tokenType][i].beneficiaries[j].percentage < 1 || data[tokenType][i].beneficiaries[j].percentage > 100) {
        setError(`wills.${willIndex}.${tokenType}.${i}.beneficiaries.${j}.percentage`, {
          type: 'manual',
          message: 'Value must be between 1 and 100',
        })
        return false
      }
      sum += Number(data[tokenType][i].beneficiaries[j].percentage)
    }
    console.log('sum', sum)
    if (sum !== 100) {
      setError(`wills.${willIndex}.${tokenType}.${i}.beneficiaries`, {
        type: 'manual',
        message: 'Field values must add up to 100.',
      })
      return false
    }
  }
  return true
}

export const validateTokenSum = async (values: FieldValues, setError: UseFormSetError<Forms>): Promise<boolean> => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data[i].tokens.length; j += 1) {
      let tokenSum = 0
      for (let k = 0; k < data[i].tokens[i].beneficiaries.length; k += 1) {
        tokenSum += Number(data[i].tokens[j].beneficiaries[k].percentage)

        if (tokenSum !== 100) {
          setError(`wills.${i}.tokens.${j}.beneficiaries.${k}.percentage`, {
            type: 'manual',
            message: 'Field values must add up to 100.',
          })

          return false
        }
      }
    }
  }
  return true
}
export const validate1155Sum = async (values: FieldValues, setError: UseFormSetError<Forms>): Promise<boolean> => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data[i].erc1155s.length; j += 1) {
      let erc1155Sum = 0
      for (let k = 0; k < data[i].erc1155s[j].beneficiaries.length; k += 1) {
        erc1155Sum += Number(data[i].erc1155s[j].beneficiaries[k].percentage)
      }
      if (erc1155Sum !== 100) {
        setError(`wills.${i}.erc1155s.${j}.beneficiaries`, {
          type: 'manual',
          message: 'Field values must add up to 100.',
        })
        return false
      }
    }
  }
  return true
}

export const validateNativeDuplicates = async (
  values: FieldValues,
  setError: UseFormSetError<Forms>,
): Promise<boolean> => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data[i].native[0].beneficiaries.length; j += 1) {
      for (let k = j + 1; k < data[i].native[0].beneficiaries.length; k += 1) {
        if (data[i].native[0].beneficiaries[j].address === data[i].native[0].beneficiaries[k].address) {
          setError(`wills.${i}.native.${j}`, {
            type: 'manual',
            message: 'Beneficiary addresses must be unique.',
          })
          return false
        }
      }
    }
  }
  return true
}
export const validateDuplicates = async (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: 'native' | 'tokens' | 'nfts' | 'erc1155s',
): Promise<boolean> => {
  if (data[tokenType].length > 0) {
    if (tokenType !== 'native') {
      for (let i = 0; i < data[tokenType].length; i += 1) {
        for (let j = i + 1; j < data[tokenType].length; j += 1) {
          if (data[tokenType][i].contractAddress === data[tokenType][j].contractAddress) {
            setError(`wills.${willIndex}.${tokenType}.${j}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })
          }
        }
      }

      for (let i = 0; i < data[tokenType].length; i += 1) {
        for (let j = 0; j < data[tokenType][i].beneficiaries.length; j += 1) {
          for (let k = j + 1; k < data[tokenType][i].beneficiaries[j].length; k += 1) {
            if (data[tokenType][i].beneficiaries[j].address === data[tokenType][i].beneficiaries[k].address) {
              setError(`wills.${willIndex}.${tokenType}.${i}.beneficiaries`, {
                type: 'manual',
                message: 'Beneficiary addresses must be unique.',
              })

              return false
            }
          }
        }
      }
    }
  }
  return true
}
export const validateNftDuplicates = (values: FieldValues, setError: UseFormSetError<Forms>): boolean => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].nfts.length > 0) {
      for (let j = 0; j < data[i].nfts.length; j += 1) {
        for (let k = j + 1; k < data[i].nfts.length; k += 1) {
          if (data[i].nfts[j].contractAddress === data[i].nfts[k].contractAddress) {
            setError(`wills.${i}.nfts.${k}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })

            return false
          }
        }
      }
      for (let j = 0; j < data[i].nfts.length; j += 1) {
        for (let k = 0; k < data[i].nfts[j].beneficiaries.length; k += 1) {
          for (let l = k + 1; l < data[i].nfts[j].beneficiaries.length; l += 1) {
            if (data[i].nfts[j].beneficiaries[k].beneficiary === data[i].nfts[j].beneficiaries[l].beneficiary) {
              setError(`wills.${i}.nfts.${j}.beneficiaries.${l}`, {
                type: 'manual',
                message: 'Beneficiary addresses must be unique.',
              })

              return false
            }
          }
        }
      }
    }
  }
  return true
}
export const validate1155Duplicates = (values: FieldValues, setError: UseFormSetError<Forms>): boolean => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].erc1155s.length > 0) {
      for (let j = 0; j < data[i].erc1155s.length; j += 1) {
        for (let k = j + 1; k < data[i].erc1155s.length; k += 1) {
          if (data[i].erc1155s[j].contractAddress === data[i].erc1155s[k].contractAddress) {
            setError(`wills.${i}.erc1155s.${k}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })

            return false
          }
        }
      }

      for (let j = 0; j < data[i].erc1155s.length; j += 1) {
        for (let k = 0; k < data[i].erc1155s[j].beneficiaries.length; k += 1) {
          for (let l = k + 1; l < data[i].erc1155s[j].beneficiaries.length; l += 1) {
            if (data[i].erc1155s[j].beneficiaries[k].address === data[i].erc1155s[j].beneficiaries[l].address) {
              setError(`wills.${i}.erc1155s.${j}.beneficiaries.${l}`, {
                type: 'manual',
                message: 'Beneficiary addresses must be unique.',
              })

              return false
            }
          }
        }
      }
    }
  }
  return true
}

export const validateContractAddresses = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: 'tokens' | 'nfts' | 'erc1155s',
): boolean => {
  for (let i = 0; i < data[tokenType].length; i += 1) {
    try {
      getAddress(data[tokenType][i].contractAddress)
    } catch (error) {
      setError(`wills.${willIndex}.${tokenType}.${i}.contractAddress`, {
        type: 'manual',
        message: 'Please enter a valid address',
      })
      return false
    }
  }

  return true
}

export const validateBeneficiaryAddresses = (
  data: FieldValues,
  setError: UseFormSetError<Forms>,
  willIndex: number,
  tokenType: 'native' | 'tokens' | 'nfts' | 'erc1155s',
): boolean => {
  for (let i = 0; i < data[tokenType].length; i += 1) {
    for (let j = 0; j < data[tokenType][i].beneficiaries.length; j += 1) {
      try {
        getAddress(data[tokenType][i].beneficiaries[j].address)
      } catch {
        setError(`wills.${willIndex}.${tokenType}.${i}.beneficiaries.${j}.address`, {
          type: 'manual',
          message: 'Please enter a valid address',
        })
        return false
      }
    }
  }
  return true
}

export const validateTokenAddresses = (values: FieldValues, setError: UseFormSetError<Forms>): boolean => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data[i].tokens.length; j += 1) {
      try {
        getAddress(data[i].tokens[j].contractAddress)
      } catch {
        setError(`wills.${i}.tokens.${j}.contractAddress`, {
          type: 'manual',
          message: 'Please enter a valid address',
        })
      }
      for (let k = 0; k < data[i].tokens[j].beneficiaries.length; k += 1) {
        try {
          getAddress(data[i].tokens[j].beneficiaries[k].address)
        } catch {
          setError(`wills.${i}.tokens.${j}.beneficiaries.${k}.address`, {
            type: 'manual',
            message: 'Please enter a valid address',
          })
          return false
        }
      }
    }
  }
  return true
}

export const validate1155Addresses = (values: FieldValues, setError: UseFormSetError<Forms>): boolean => {
  const data = values.wills
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data[i].erc1155s.length; j += 1) {
      try {
        getAddress(data[i].erc1155s[j].contractAddress)
      } catch {
        setError(`wills.${i}.erc1155s.${j}.contractAddress`, {
          type: 'manual',
          message: 'Please enter a valid address',
        })
      }
      for (let k = 0; k < data[i].erc1155s[j].beneficiaries.length; k += 1) {
        try {
          getAddress(data[i].erc1155s[j].beneficiaries[k].address)
        } catch {
          setError(`wills.${i}.erc1155s.${j}.beneficiaries.${k}.address`, {
            type: 'manual',
            message: 'Please enter a valid address',
          })
          return false
        }
      }
    }
  }
  return true
}
