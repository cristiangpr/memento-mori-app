import { Dispatch, SetStateAction } from 'react'
import { UseFormSetError } from 'react-hook-form'
import { FormTypes, Forms } from '../types'

export const validateFieldsSum = (data: FormTypes[], setError: UseFormSetError<Forms>): boolean => {
  for (let h = 0; h < data.length; h += 1) {
    let nativeSum = 0
    for (let i = 0; i < data[h].native[0].beneficiaries.length; i += 1) {
      nativeSum += Number(data[h].native[0].beneficiaries[i].percentage)
    }
    if (nativeSum !== 100) {
      setError(`wills.${h}.native.${0}.beneficiaries`, {
        type: 'manual',
        message: 'Field values must add up to 100.',
      })
      return false
    }

    for (let i = 0; i < data[h].tokens.length; i += 1) {
      let tokenSum = 0
      for (let j = 0; j < data[h].tokens[i].beneficiaries.length; j += 1) {
        tokenSum += Number(data[h].tokens[i].beneficiaries[j].percentage)
      }
      if (tokenSum !== 100) {
        setError(`wills.${h}.tokens.${i}.beneficiaries`, {
          type: 'manual',
          message: 'Field values must add up to 100.',
        })

        return false
      }
    }
    for (let i = 0; i < data[h].erc1155s.length; i += 1) {
      let erc1155Sum = 0
      for (let j = 0; j < data[h].erc1155s[i].beneficiaries.length; j += 1) {
        erc1155Sum += Number(data[h].erc1155s[i].beneficiaries[j].percentage)
      }
      if (erc1155Sum !== 100) {
        setError(`wills.${h}.erc1155s.${i}.beneficiaries`, {
          type: 'manual',
          message: 'Field values must add up to 100.',
        })
        return false
      }
    }
  }
  return true
}

export const validateDuplicates = (data: FormTypes[], setError: UseFormSetError<Forms>): boolean => {
  for (let h = 0; h < data.length; h += 1) {
    for (let i = 0; i < data[h].native[0].beneficiaries.length; i += 1) {
      for (let j = i + 1; j < data[h].native[0].beneficiaries.length; j += 1) {
        if (data[h].native[0].beneficiaries[i].address === data[h].native[0].beneficiaries[j].address) {
          setError(`wills.${h}.native.${i}`, {
            type: 'manual',
            message: 'Beneficiary addresses must be unique.',
          })
          return false
        }
      }
    }
    if (data[h].tokens.length > 0) {
      for (let i = 0; i < data[h].tokens.length; i += 1) {
        for (let j = i + 1; j < data[h].tokens.length; j += 1) {
          if (data[h].tokens[i].contractAddress === data[h].tokens[j].contractAddress) {
            setError(`wills.${h}.tokens.${j}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })

            return false
          }
        }
      }

      for (let i = 0; i < data[h].tokens.length; i += 1) {
        for (let j = 0; j < data[h].tokens[i].beneficiaries.length; j += 1) {
          for (let k = j + 1; k < data[h].tokens[i].beneficiaries.length; k += 1) {
            if (data[h].tokens[i].beneficiaries[j].address === data[h].tokens[i].beneficiaries[k].address) {
              setError(`wills.${h}.tokens.${i}`, {
                type: 'manual',
                message: 'Beneficiary addresses must be unique.',
              })

              return false
            }
          }
        }
      }
    }
    if (data[h].nfts.length > 0) {
      for (let i = 0; i < data[h].nfts.length; i += 1) {
        for (let j = i + 1; j < data[h].nfts.length; j += 1) {
          if (data[h].nfts[i].contractAddress === data[h].nfts[j].contractAddress) {
            setError(`wills.${h}.nfts.${j}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })

            return false
          }
        }
      }
      for (let i = 0; i < data[h].nfts.length; i += 1) {
        for (let j = 0; j < data[h].nfts[i].beneficiaries.length; j += 1) {
          for (let k = j + 1; k < data[h].nfts[i].beneficiaries.length; k += 1) {
            if (data[h].nfts[i].beneficiaries[j].beneficiary === data[h].nfts[i].beneficiaries[k].beneficiary) {
              setError(`wills.${h}.nfts.${i}.beneficiaries.${k}`, {
                type: 'manual',
                message: 'Beneficiary addresses must be unique.',
              })

              return false
            }
          }
        }
      }
    }
    if (data[h].erc1155s.length > 0) {
      for (let i = 0; i < data[h].erc1155s.length; i += 1) {
        for (let j = i + 1; j < data[h].erc1155s.length; j += 1) {
          if (data[h].erc1155s[i].contractAddress === data[h].erc1155s[j].contractAddress) {
            setError(`wills.${h}.erc1155s.${j}.contractAddress`, {
              type: 'manual',
              message: 'Token addresses must be unique.',
            })

            return false
          }
        }
      }

      for (let i = 0; i < data[h].erc1155s.length; i += 1) {
        for (let j = 0; j < data[h].erc1155s[i].beneficiaries.length; j += 1) {
          for (let k = j + 1; k < data[h].erc1155s[i].beneficiaries.length; k += 1) {
            if (data[h].erc1155s[i].beneficiaries[j].address === data[h].erc1155s[i].beneficiaries[k].address) {
              setError(`wills.${h}.erc1155s.${i}.beneficiaries.${k}`, {
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
