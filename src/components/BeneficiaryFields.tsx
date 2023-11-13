import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import { ErrorDescription } from 'ethers'
import { LeftColumn, RightColumn, Row } from './FormElements'

export default function BeneficiaryFields({ tokenType, nestIndex, control, errors, clearErrors }): React.ReactElement {
  const isNative = tokenType === 'nativeToken'
  const {
    fields: beneficiaryFields,
    remove: removeBeneficiary,
    append: appendBeneficiary,
  } = useFieldArray({
    control,
    name: `${tokenType}.${nestIndex}.beneficiaries`,
  })

  return (
    <>
      {beneficiaryFields.map((element, index) => {
        return (
          <Row key={element.id}>
            <LeftColumn>
              <Controller
                control={control}
                rules={{ required: true }}
                name={
                  tokenType === 'nfts'
                    ? `${tokenType}.${nestIndex}.beneficiaries.${index}.tokenId`
                    : `${tokenType}.${nestIndex}.beneficiaries.${index}.address.`
                }
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <TextFieldInput
                    value={tokenType === 'nfts' ? Number(value) : value}
                    onBlur={() => {
                      onBlur()
                      clearErrors()
                    }} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    inputRef={ref}
                    label={tokenType === 'nfts' ? 'token Id' : 'beneficiary address'}
                    helperText={
                      tokenType === 'nfts'
                        ? ''
                        : 'Make sure at least one beneficiary is a Safe in order to request execution using this app. Non Safe addresses can request execution by interacting directly with the contract.'
                    }
                    name={
                      tokenType === 'nfts'
                        ? `${tokenType}.${nestIndex}.beneficiaries.${index}.tokenId`
                        : `${tokenType}.${nestIndex}.beneficiaries.${index}.address`
                    }
                    error={errors[tokenType] && errors[tokenType][nestIndex] && errors[tokenType][nestIndex].message}
                  />
                )}
              />
            </LeftColumn>
            <RightColumn>
              <Controller
                control={control}
                name={
                  tokenType === 'nfts'
                    ? `${tokenType}.${nestIndex}.beneficiaries.${index}.beneficiary`
                    : `${tokenType}.${nestIndex}.beneficiaries.${index}.percentage`
                }
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <TextFieldInput
                    value={tokenType === 'nfts' ? value : Number(value)}
                    onBlur={() => {
                      onBlur()
                      clearErrors()
                    }} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    inputRef={ref}
                    label={tokenType === 'nfts' ? 'beneficiary address' : 'percentage'}
                    name={
                      tokenType === 'nfts'
                        ? `${tokenType}.${nestIndex}.beneficiaries.${index}.address`
                        : `${tokenType}.${nestIndex}.beneficiaries.${index}.percentage`
                    }
                    helperText={tokenType !== 'nfts' && 'Make sure percentages add up to 100'}
                    error={
                      errors &&
                      errors[tokenType] &&
                      errors[tokenType][nestIndex] &&
                      errors[tokenType][nestIndex].beneficiaries &&
                      errors[tokenType][nestIndex].beneficiaries.message
                    }
                  />
                )}
              />
            </RightColumn>
          </Row>
        )
      })}

      <div style={{ marginBottom: !isNative && '10px' }}>
        <Button size="md" onClick={() => appendBeneficiary({ address: '', percentage: null })}>
          {tokenType === 'nfts' ? 'Add Token Id' : 'Add Beneficiary'}
        </Button>
        {beneficiaryFields.length > 1 && (
          <Button
            size="md"
            style={{ marginLeft: '1rem' }}
            onClick={() => removeBeneficiary(beneficiaryFields.length - 1)}
          >
            {tokenType === 'nfts' ? 'Remove Token Id' : 'Remove Beneficiary'}
          </Button>
        )}
      </div>
    </>
  )
}
