/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Dot, GenericModal, Icon, Loader } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { TransactionStatus, TransactionType } from '../types'
import { Row } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'

export const Native: React.FC<{
  nativeTokenFields: Record<'id', string>[]
  nestIndex: number
}> = ({ nativeTokenFields, nestIndex }) => {
  const {
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useFormContext()
  return (
    <>
      {' '}
      <Row>
        Define at least one beneficiary for your native tokens (ETH, MATIC). Each beneficiary will recieve the
        percentage of your tokens entered next to their address. This step is required.
      </Row>
      {nativeTokenFields.map((element, index) => {
        return <BeneficiaryFields key={element.id} willIndex={nestIndex} tokenType="native" nestIndex={index} />
      })}
    </>
  )
}
