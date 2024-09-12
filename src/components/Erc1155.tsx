/* eslint-disable react/function-component-definition */

import { Button, Title } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Row, RightColumn, LeftColumn, StyledInput } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'

export const Erc1155: React.FC<{
  erc1155Fields: Record<'id', string>[]
  nestIndex: number

  appendErc1155
  removeErc1155
}> = ({ erc1155Fields, nestIndex, appendErc1155, removeErc1155 }) => {
  const {
    control,

    formState: { errors },
  } = useFormContext()
  return (
    <>
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
                  name={`wills.${nestIndex}.erc1155s.${index}.contractAddress`}
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
                      name={`wills.${nestIndex}.erc1155s.${index}.contractAddress`}
                      error={
                        errors &&
                        errors.wills &&
                        errors.wills[nestIndex] &&
                        errors.wills[nestIndex].erc1155s &&
                        errors.wills[nestIndex].erc1155s[index] &&
                        errors.wills[nestIndex].erc1155s[index].contractAddress
                          ? errors.wills[nestIndex].erc1155s[index].contractAddress.message
                          : error?.type
                      }
                    />
                  )}
                />
              </LeftColumn>
              <RightColumn>
                <Controller
                  control={control}
                  name={`wills.${nestIndex}.erc1155s.${index}.tokenId`}
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
                      label="token id"
                      name={`wills.${nestIndex}.erc1155s.${index}.tokenId`}
                      error={error?.type}
                    />
                  )}
                />
              </RightColumn>
            </Row>
            <BeneficiaryFields willIndex={nestIndex} tokenType="erc1155s" nestIndex={index} />
          </div>
        )
      })}
      <Button
        size="md"
        onClick={() =>
          appendErc1155({ contractAddress: '', tokenId: null, beneficiaries: [{ address: '', percentage: null }] })
        }
      >
        Add ERC1155
      </Button>
      {erc1155Fields.length > 0 && (
        <Button size="md" style={{ marginLeft: '1rem' }} onClick={() => removeErc1155(erc1155Fields.length - 1)}>
          Remove ERC1155
        </Button>
      )}
    </>
  )
}
