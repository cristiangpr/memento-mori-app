/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import React, { FormEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Title,
  Button,
  TextFieldInput,
  Tab,
  Menu,
  Select,
  GenericModal,
  Loader,
  Dot,
  Icon,
} from '@gnosis.pm/safe-react-components'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { BaseContract, Contract, JsonRpcProvider, ZeroAddress, getAddress, getDefaultProvider } from 'ethers'
import { useSafeBalances } from '../hooks/useSafeBalances'
import BalancesTable from './BalancesTable'
import { DisplayData, Form, FormTypes } from '../types'
import {
  cancelExecution,
  createWill,
  deleteWill,
  executeWill,
  formatData,
  getExecTime,
  getWill,
  requestExecution,
} from '../utils'
import { Container, Row, LeftColumn, RightColumn, WillForm } from './FormElements'
// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './BeneficiaryFields'
import { MM_ADDRESS } from '../constants'
import ABI from '../abis/mementoMori.json'
import { validateDuplicates, validateFieldsSum } from '../validation'

function MyWill({ nestIndex, control, errors, clearErrors }): React.ReactElement {
  const { sdk } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
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

  return (
    <div>
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
        Define beneficiaries and percentages for your ERC20 tokens. Each beneficiary will recieve the percentage of your
        tokens entered next to their address. Below is a list of ERC20 tokens we detect in your Safe. They may be added
        to your will by clicking the "Add Token" button. If you don't see your tokens on the list you may add them
        manually using the form below. If you have no ERC20 tokens you wish to inherit you may skip this step
      </Row>
      <Title size="sm">Your Tokens</Title>
      {nestIndex === 0 && <BalancesTable balances={balances} addToken={appendToken} />}
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
        Define beneficiaries for your NFTs. NFTs have a unique id and may only have one beneficiary each. If you have no
        ERC721 NFTs you wish to inherit you may skip this step.
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
        Define beneficiaries for your ERC1155 tokens. ERC1155 tokens may be fungible or non fungible. If your ERC1155 is
        non fungible make sure you define only one beneficiary and that their percentage is set to 100. If you have no
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
    </div>
  )
}

export default MyWill
