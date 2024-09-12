/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Button } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TransactionStatus, TransactionType } from '../types'
import { Row, StyledInput, StyledTitle } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'
import BalancesTable from './BalancesTable'

export const Erc20: React.FC<{
  tokenFields: Record<string, string>[]
  nestIndex: number

  appendToken
  removeToken
  balances
}> = ({ tokenFields, nestIndex, appendToken, removeToken, balances }) => {
  const {
    control,

    formState: { errors },
  } = useFormContext()
  return (
    <>
      <Row>
        Define beneficiaries and percentages for your ERC20 tokens. Each beneficiary will recieve the percentage of your
        tokens entered next to their address. Below is a list of ERC20 tokens we detect in your Safe. They may be added
        to your will by clicking the "Add Token" button. If you don't see your tokens on the list you may add them
        manually using the form below. If you have no ERC20 tokens you wish to inherit you may skip this step
      </Row>

      {nestIndex === 0 && (
        <>
          <StyledTitle size="sm">Your Tokens</StyledTitle>
          <BalancesTable balances={balances} addToken={appendToken} />
        </>
      )}
      {tokenFields.map((element, index) => {
        return (
          <div key={element.id}>
            <StyledTitle size="sm">{element.name ? element.name : `Token ${index + 1}`}</StyledTitle>
            <Row>
              <Controller
                control={control}
                name={`wills.${nestIndex}.tokens.${index}.contractAddress`}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <StyledInput
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    inputRef={ref}
                    label="contract address"
                    name={`wills.${nestIndex}.tokens.${index}.contractAddress`}
                    value={value}
                    error={
                      errors &&
                      errors.wills &&
                      errors.wills[nestIndex] &&
                      errors.wills[nestIndex].tokens &&
                      errors.wills[nestIndex].tokens[index] &&
                      errors.wills[nestIndex].tokens[index].contractAddress
                        ? errors.wills[nestIndex].tokens[index].contractAddress.message
                        : error?.type
                    }
                  />
                )}
              />
            </Row>
            <BeneficiaryFields willIndex={nestIndex} tokenType="tokens" nestIndex={index} />
          </div>
        )
      })}
      <Button
        style={{ marginTop: '1rem' }}
        size="md"
        onClick={() => appendToken({ contractAddress: '', beneficiaries: [{ address: '', percentage: null }] })}
      >
        Add Token
      </Button>
      {tokenFields.length > 0 && (
        <Button
          size="md"
          style={{ marginLeft: '1rem', marginTop: '1rem' }}
          onClick={() => removeToken(tokenFields.length - 1)}
        >
          Remove Token
        </Button>
      )}
    </>
  )
}
