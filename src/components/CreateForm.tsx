/* eslint-disable no-param-reassign */
import React, { FormEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Title, Button, TextFieldInput, Tab, Menu } from '@gnosis.pm/safe-react-components'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { ZeroAddress } from 'ethers'
import { useSafeBalances } from '../hooks/useSafeBalances'
import BalancesTable from './BalancesTable'
import { DisplayData, Form, FormTypes } from '../types'
import { createWill, deleteWill, executeWill, formatData, getExecTime, getWill, requestExecution } from '../utils'
import { Container, Row, LeftColumn, RightColumn, WillForm } from './FormElements'
// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './BeneficiaryFields'

function CreateForm(): React.ReactElement {
  const { sdk, safe } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
  const [displayData, setDisplayData] = useState<DisplayData>()
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()
  const [hasWill, setHasWill] = useState<boolean>(false)

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    watch,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FormTypes>({
    defaultValues: {
      [Form.Cooldown]: null,

      [Form.NativeToken]: [
        {
          beneficiaries: [{ address: '', percentage: null }],
        },
      ],

      [Form.Tokens]: displayData ? displayData.tokens : [],
      [Form.NFTS]: displayData ? displayData.nfts : [],
      [Form.Erc1155s]: displayData ? displayData.erc1155s : [],
    },
  })
  useEffect(() => {
    const loadData = async () => {
      const data = await getWill(safe.safeAddress, sdk)
      setDisplayData(data)
      if (displayData && displayData.executors.length > 0) {
        setHasWill(true)
      }
      if (displayData && displayData.isActive) {
        setExecTime(getExecTime(displayData))
        if (getExecTime(displayData) <= Date.now()) {
          setIsExecutable(true)
        }
      }
    }
    loadData()
  }, [displayData, safe, sdk])
  useEffect(() => {
    if (hasWill) {
      reset({
        cooldown: Number(displayData.cooldown),
        nativeToken: [displayData.nativeToken],
        tokens: displayData.tokens,
        nfts: displayData.nfts,
        erc1155s: displayData.erc1155s,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, hasWill])

  const { fields: nativeTokenFields } = useFieldArray({
    control,
    name: 'nativeToken',
  })
  const {
    fields: tokenFields,
    append: appendToken,
    remove: removeToken,
  } = useFieldArray({
    control,
    name: 'tokens',
  })

  const {
    fields: nftFields,
    append: appendNft,
    remove: removeNft,
  } = useFieldArray({
    control,
    name: 'nfts',
  })

  const {
    fields: erc1155Fields,
    append: append1155,
    remove: remove1155,
  } = useFieldArray({
    control,
    name: 'erc1155s',
  })

  const validateFieldsSum = async (data) => {
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

  const validateDuplicates = async (data) => {
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
            if (data.nfts[i].beneficiaries[j].beneficiary === data.tokens[i].beneficiaries[k].beneficiary) {
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

  const onSubmit = async (data): Promise<void> => {
    const sumValidated = await validateFieldsSum(data)
    const validated = await validateDuplicates(data)
    if (validated && sumValidated) {
      const newData = formatData(data, safe.safeAddress)

      await createWill(newData, sdk, safe)
    }
  }
  const handleScroll = (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }
  return (
    <Container>
      {console.log('get', displayData)}
      <Title size="lg">Memento Mori</Title>
      <Title size="md">Your Tokens</Title>
      <BalancesTable balances={balances} addToken={appendToken} />
      <Title size="md">{displayData ? 'My Will' : 'Create Will'}</Title>

      <WillForm onSubmit={handleSubmit(onSubmit)}>
        <Title size="sm">Cooldown Period</Title>
        <Row>
          <LeftColumn>
            <Controller
              control={control}
              name="cooldown"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, isTouched, isDirty, error },
                formState,
              }) => (
                <TextFieldInput
                  value={value}
                  type="number"
                  onBlur={onBlur} // notify when input is touched
                  onChange={onChange} // send value to hook form
                  ref={ref}
                  label={displayData ? '' : 'cooldown period in milliseconds'}
                  name="cooldown"
                  error={error?.type}
                  showErrorsInTheLabel
                />
              )}
            />
          </LeftColumn>
        </Row>

        <Title size="sm">Native Token Beneficiaries</Title>
        {nativeTokenFields.map((element, index) => {
          return (
            <BeneficiaryFields
              tokenType="nativeToken"
              nestIndex={index}
              control={control}
              errors={errors}
              clearErrors={clearErrors}
            />
          )
        })}

        <Title size="sm">Tokens</Title>
        {tokenFields.map((element, index) => {
          return (
            <div key={element.id}>
              <Title size="xs">{`Token ${index + 1}`}</Title>
              <Row>
                <Controller
                  control={control}
                  name={`tokens.${index}.contractAddress`}
                  rules={{ required: true }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <TextFieldInput
                      onBlur={onBlur} // notify when input is touched
                      onChange={onChange} // send value to hook form
                      inputRef={ref}
                      label="contract address"
                      name={`tokens.${index}.contractAddress`}
                      value={value}
                      error={
                        errors && errors.tokens && errors.tokens[index] && errors.tokens[index].contractAddress
                          ? errors.tokens[index].contractAddress.message
                          : error?.type
                      }
                    />
                  )}
                />
              </Row>
              <BeneficiaryFields
                tokenType="tokens"
                nestIndex={index}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
              />
            </div>
          )
        })}
        <Button
          size="md"
          onClick={() => appendToken({ contractAddress: '', beneficiaries: [{ address: '', percentage: null }] })}
        >
          Add Token
        </Button>
        {tokenFields.length > 0 && (
          <Button size="md" style={{ marginLeft: '1rem' }} onClick={() => removeToken(tokenFields.length - 1)}>
            Remove Token
          </Button>
        )}
        <Title size="sm">NFTs</Title>
        {nftFields.map((element, index) => {
          return (
            <div key={element.id}>
              <Title size="xs">{`NFT ${index + 1}`}</Title>
              <Row>
                <Controller
                  control={control}
                  name={`nfts.${index}.contractAddress`}
                  rules={{ required: true }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <TextFieldInput
                      onBlur={onBlur} // notify when input is touched
                      onChange={onChange} // send value to hook form
                      inputRef={ref}
                      label="contract address"
                      name={`nfts.${index}.contractAddress`}
                      value={value}
                      error={error?.type}
                    />
                  )}
                />
              </Row>
              <BeneficiaryFields
                tokenType="nfts"
                nestIndex={index}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
              />
            </div>
          )
        })}
        <Button
          size="md"
          onClick={() => appendNft({ contractAddress: '', beneficiaries: [{ tokenId: null, beneficiary: '' }] })}
        >
          Add NFT
        </Button>
        {nftFields.length > 0 && (
          <Button size="md" style={{ marginLeft: '1rem' }} onClick={() => removeNft(nftFields.length - 1)}>
            Remove NFT
          </Button>
        )}
        <Title size="sm">ERC1155 Tokens</Title>
        {erc1155Fields.map((element, index) => {
          return (
            <div key={element.id}>
              <Title size="xs">{`ERC1155 ${index + 1}`}</Title>
              <Row>
                <Controller
                  control={control}
                  name={`erc1155s.${index}.contractAddress`}
                  rules={{ required: true }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <TextFieldInput
                      onBlur={onBlur} // notify when input is touched
                      onChange={onChange} // send value to hook form
                      inputRef={ref}
                      label="contract address"
                      name={`erc1155s.${index}.contractAddress`}
                      error={error?.type}
                    />
                  )}
                />
              </Row>
              <Row>
                <Controller
                  control={control}
                  name={`erc1155s.${index}.tokenId`}
                  rules={{ required: true }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <TextFieldInput
                      onBlur={onBlur} // notify when input is touched
                      onChange={onChange} // send value to hook form
                      inputRef={ref}
                      label="token id"
                      name={`erc1155s.${index}.tokenId`}
                      error={error?.type}
                    />
                  )}
                />
              </Row>
              <BeneficiaryFields
                tokenType="erc1155s"
                nestIndex={index}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
              />
            </div>
          )
        })}
        <Button
          size="md"
          onClick={() =>
            append1155({ contractAddress: '', tokenId: null, beneficiaries: [{ address: '', percentage: null }] })
          }
        >
          Add ERC1155
        </Button>
        {erc1155Fields.length > 0 && (
          <Button size="md" style={{ marginLeft: '1rem' }} onClick={() => remove1155(erc1155Fields.length - 1)}>
            Remove ERC1155
          </Button>
        )}
        <Row style={{ justifyContent: 'center' }}>
          <Button size="md" type="submit">
            {hasWill ? 'Update Will' : 'Create Will'}
          </Button>
        </Row>
        {hasWill && (
          <>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" onClick={() => deleteWill(sdk)}>
                Delete Will
              </Button>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" onClick={() => requestExecution(safe.safeAddress, sdk)}>
                Request Execution
              </Button>
            </Row>
          </>
        )}

        {execTime && (
          <div style={{ padding: '20px' }}>
            <div>Will executable after {new Date(execTime).toDateString()}</div>
          </div>
        )}
        {isExecutable && (
          <div style={{ padding: '20px' }}>
            <Button size="md" onClick={() => executeWill(safe.safeAddress, sdk)}>
              Execute Will
            </Button>
          </div>
        )}
      </WillForm>
    </Container>
  )
}

export default CreateForm
