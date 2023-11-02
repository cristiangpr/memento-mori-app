/* eslint-disable no-param-reassign */
import React, { FormEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Title, Button, TextFieldInput, Tab, Menu, Select } from '@gnosis.pm/safe-react-components'
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

function MyWill(): React.ReactElement {
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
      <Title size="lg">Memento Mori</Title>
      <Row style={{ width: '65%' }}>
        Memento Mori is an app that lets you create a will for your Safe. Beneficiaries of a will may request execution.
        If execution is not canceled by the Safe owner during the cooldown period the will may be executed
      </Row>
      <Title size="md">Your Tokens</Title>
      <Row style={{ width: '65%' }}>
        Below is a list of the tokens we detect in your Safe. They may be added to your will by clicking the "Add Token"
        button. If you don't see your tokens on the list you may add them manually using the form below.
      </Row>
      <BalancesTable balances={balances} addToken={appendToken} />
      <Title size="md">{hasWill ? 'My Will' : 'Create Will'}</Title>
      <Row style={{ width: '65%' }}>
        {hasWill
          ? 'Below is your current will. You may add or delete tokens using the form and click the "Update Will" button to save changes. You may also delete the will or request execution by owner by clcking the appropriate buttons.'
          : 'Follow the steps below to create a will. Make sure at least one beneficiary is a Safe so they may request execution using this app. Non Safe addresses may request execution by interacting directly with the contract.'}
      </Row>

      <WillForm onSubmit={handleSubmit(onSubmit)}>
        <Title size="sm">Step 1.- Native Token Beneficiaries</Title>
        <Row>
          Define at least one beneficiary for your native tokens (ETH, MATIC). Each beneficiary will recieve the
          percentage of your tokens entered next to their address. This step is required.
        </Row>
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

        <Title size="sm">Step 2.- ERC20 Tokens</Title>
        <Row>
          Define beneficiaries and percentages for your ERC20 tokens. Each beneficiary will recieve the percentage of
          your tokens entered next to their address. If you have no ERC20 tokens you wish to inherit you may skip this
          step
        </Row>
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
        <Title size="sm">Step 3.- ERC721 NFTs</Title>
        <Row>
          Define beneficiaries for your NFTs. NFTs have a unique id and may only have one beneficiary each. If you have
          no ERC721 NFTs you wish to inherit you may skip this step.
        </Row>
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
        <Title size="sm">Step 4.- ERC1155 Tokens</Title>
        <Row>
          Define beneficiaries for your ERC1155 tokens. ERC1155 tokens may be fungible or non fungible. If your ERC1155
          is non fungible make sure you define only one beneficiary and their percentage is set to 100. If you have no
          ERC1155 tokens you wish to inherit you may skip this step.
        </Row>
        {erc1155Fields.map((element, index) => {
          return (
            <div key={element.id}>
              <Title size="xs">{`ERC1155 ${index + 1}`}</Title>
              <Row>
                <LeftColumn>
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
                </LeftColumn>
                <RightColumn>
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
                </RightColumn>
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
        <Title size="sm">Step 5.- Cooldown Period</Title>
        <Row>Define the period iseconds after an execution request is made where you may still cancel execution.</Row>
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
                  label="cooldown period in seconds"
                  name="cooldown"
                  error={error?.type}
                  showErrorsInTheLabel
                />
              )}
            />
          </LeftColumn>
          <RightColumn />
        </Row>
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
          <Row style={{ justifyContent: 'center' }}>
            <div>Will executable after {new Date(execTime * 1000).toLocaleString()}</div>
          </Row>
        )}

        <Row style={{ justifyContent: 'center' }}>
          <Button size="md" onClick={() => executeWill(sdk, safe.safeAddress)}>
            Execute Will
          </Button>
        </Row>
      </WillForm>
    </Container>
  )
}

export default MyWill
