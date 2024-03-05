/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Button, Dot, GenericModal, Icon, Loader, Title } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { Controller } from 'react-hook-form'
import { TransactionStatus, TransactionType } from '../types'
import { Row, RightColumn, LeftColumn, StyledInput } from './FormElements'
import BeneficiaryFields from './BeneficiaryFields'

export const Cooldown: React.FC<{
  nestIndex: number
  control
  errors
  clearErrors
}> = ({ nestIndex, control, errors, clearErrors }) => {
  return (
    <div>
      {nestIndex === 0 ? (
        <>
          <Row>Define the period iseconds after an execution request is made where you may still cancel execution.</Row>
          <Row>
            <LeftColumn>
              <Controller
                control={control}
                name={`wills.${nestIndex}.cooldown`}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <StyledInput
                    value={value}
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    ref={ref}
                    label="cooldown period in seconds"
                    name={`wills.${nestIndex}.cooldown`}
                    error={error?.type}
                    showErrorsInTheLabel
                  />
                )}
              />
            </LeftColumn>
            <RightColumn />
          </Row>
        </>
      ) : (
        <>
          <Row>
            <Title size="sm">Step 5.- Chain Selector</Title>
            <Row>Enter the chain selector for the network your additional Safe is deployed on.</Row>
            <LeftColumn>
              <Controller
                control={control}
                name={`wills.${nestIndex}.chainSelector`}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <StyledInput
                    value={value}
                    type="string"
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    ref={ref}
                    label="destination chain selector"
                    name={`wills.${nestIndex}.chainSelector`}
                    error={error?.type}
                    showErrorsInTheLabel
                  />
                )}
              />
            </LeftColumn>
            <RightColumn />
          </Row>
          <Row>
            <Title size="sm">Step 6.- Cross Chain Safe Address</Title>
            <Row>Enter the address of your additional Safe.</Row>
            <LeftColumn>
              <Controller
                control={control}
                name={`wills.${nestIndex}.safe`}
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <StyledInput
                    value={value}
                    type="string"
                    onBlur={onBlur} // notify when input is touched
                    onChange={onChange} // send value to hook form
                    ref={ref}
                    label="destination chain safe address"
                    name={`wills.${nestIndex}.safe`}
                    error={error?.type}
                    showErrorsInTheLabel
                  />
                )}
              />
            </LeftColumn>
            <RightColumn />
          </Row>
        </>
      )}
    </div>
  )
}
