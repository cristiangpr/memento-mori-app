/* eslint-disable react/function-component-definition */

import React from 'react'
import { useFormContext } from 'react-hook-form'

import { Row } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'

export function Native({ nativeTokenFields, nestIndex }): React.ReactElement {
  return (
    <>
      {' '}
      <Row>
        Define at least one beneficiary for your native tokens (ETH, MATIC). Each beneficiary will receive the
        percentage of your tokens entered next to their address. This step is required.
      </Row>
      {nativeTokenFields.map((element, index) => {
        return <BeneficiaryFields key={element.id} willIndex={nestIndex} tokenType="native" nestIndex={index} />
      })}
    </>
  )
}
