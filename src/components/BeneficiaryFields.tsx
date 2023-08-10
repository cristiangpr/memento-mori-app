import React, { useEffect } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import { ErrorDescription } from 'ethers'
import { LeftColumn, RightColumn, Row } from './FormElements'

export default function BeneficiaryFields({ tokenType, nestIndex, control }): React.ReactElement {
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
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    inputRef={ref}
                    label={tokenType === 'nfts' ? 'token Id' : 'beneficiary address'}
                    name={
                      tokenType === 'nfts'
                        ? `${tokenType}.${nestIndex}.beneficiaries.${index}.tokenId`
                        : `${tokenType}.${nestIndex}.beneficiaries.${index}.address`
                    }
                    error={error?.type}
                  />
                )}
              />
            </LeftColumn>
            <RightColumn>
              <Controller
                control={control}
                rules={{ required: true }}
                name={
                  tokenType === 'nfts'
                    ? `${tokenType}.${nestIndex}.beneficiaries.${index}.address`
                    : `${tokenType}.${nestIndex}.beneficiaries.${index}.percentage`
                }
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <TextFieldInput
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    inputRef={ref}
                    label={tokenType === 'nfts' ? 'beneficiary address' : 'percentage'}
                    name={
                      tokenType === 'nfts'
                        ? `${tokenType}.${nestIndex}.beneficiaries.${index}.address`
                        : `${tokenType}.${nestIndex}.beneficiaries.${index}.percentage`
                    }
                    helperText={tokenType !== 'nfts' && 'Make sure percentages add up to 100'}
                    error={error?.type}
                  />
                )}
              />
            </RightColumn>
          </Row>
        )
      })}

      <div style={{ marginBottom: !isNative && '10px' }}>
        <Button size="md" onClick={() => appendBeneficiary({})}>
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
