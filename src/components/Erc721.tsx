/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Button, Title } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Row, StyledInput } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'

export const Erc721: React.FC<{
  nftFields: Record<'id', string>[]
  nestIndex: number

  appendNft
  removeNft
}> = ({ nftFields, nestIndex, appendNft, removeNft }) => {
  const {
    control,

    formState: { errors },
  } = useFormContext()
  return (
    <>
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
                name={`wills.${nestIndex}.nfts.${index}.contractAddress`}
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
                    name={`wills.${nestIndex}.nfts.${index}.contractAddress`}
                    value={value}
                    error={
                      errors &&
                      errors.wills &&
                      errors.wills[nestIndex] &&
                      errors.wills[nestIndex].nfts &&
                      errors.wills[nestIndex].nfts[index] &&
                      errors.wills[nestIndex].nfts[index].contractAddress
                        ? errors.wills[nestIndex].nfts[index].contractAddress.message
                        : error?.type
                    }
                  />
                )}
              />
            </Row>
            <BeneficiaryFields willIndex={nestIndex} tokenType="nfts" nestIndex={index} />
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
    </>
  )
}
