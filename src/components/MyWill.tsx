/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import React, { FormEvent, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Title, Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Controller, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { BaseContract, Contract, getDefaultProvider } from 'ethers'
import { useSafeBalances } from '../hooks/useSafeBalances'
import BalancesTable from './BalancesTable'
import { Form, FormTypes } from '../types'

import { Container, Row, LeftColumn, RightColumn, WillForm, StyledStepper, StyledTitle } from './FormElements'
// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './BeneficiaryFields'
import { sepoliaMmAddress } from '../constants'
import ABI from '../abis/mementoMori.json'
import {
  validatePercentages,
  validateDuplicates,
  validateContractAddresses,
  validateBeneficiaryAddresses,
} from '../validation'
import { Native } from './Native'
import { Erc20 } from './Erc20'
import { Erc721 } from './Erc721'
import { Erc1155 } from './Erc1155'
import { Cooldown } from './Cooldown'

function MyWill({ nestIndex, setIsOpen, setIsReady, hasWill }): React.ReactElement {
  const { sdk } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
  const [activeStep, setActiveStep] = useState(0)

  const {
    control,
    clearErrors,
    setError,
    formState: { errors },
    getValues,
  } = useFormContext()
  const { fields: nativeTokenFields, replace } = useFieldArray({
    control,
    name: `wills.${nestIndex}.native`,
  })
  const {
    fields: tokenFields,
    append: appendToken,
    remove: removeToken,
  } = useFieldArray({
    control,
    name: `wills.${nestIndex}.tokens`,
  })

  const {
    fields: nftFields,
    append: appendNft,
    remove: removeNft,
  } = useFieldArray({
    control,
    name: `wills.${nestIndex}.nfts`,
  })

  const {
    fields: erc1155Fields,
    append: append1155,
    remove: remove1155,
  } = useFieldArray({
    control,
    name: `wills.${nestIndex}.erc1155s`,
  })
  const steps = [
    { id: '0', label: 'Define native token beneficiaries' },
    { id: '1', label: 'Add ERC20 Tokens and beneficiaries' },
    { id: '2', label: 'Add Nfts,' },
    { id: '3', label: 'Add erc1155' },
    { id: '4', label: 'Options' },
  ]
  useEffect(() => {
    if (activeStep === 5) {
      setIsReady(true)
    } else {
      setIsReady(false)
    }
  })

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Native nativeTokenFields={nativeTokenFields} nestIndex={nestIndex} />
      case 1:
        return (
          <Erc20
            tokenFields={tokenFields}
            nestIndex={nestIndex}
            balances={balances}
            appendToken={appendToken}
            removeToken={removeToken}
          />
        )
      case 2:
        return <Erc721 nftFields={nftFields} nestIndex={nestIndex} appendNft={appendNft} removeNft={removeNft} />
      case 3:
        return (
          <Erc1155
            erc1155Fields={erc1155Fields}
            nestIndex={nestIndex}
            appendErc1155={append1155}
            removeErc1155={remove1155}
          />
        )
      case 4:
        return <Cooldown nestIndex={nestIndex} control={control} errors={errors} clearErrors={clearErrors} />
      default:
        return 'Unknown step'
    }
  }
  const handleNext = async (step: number): Promise<void> => {
    const data = getValues()

    switch (step) {
      case 0:
        validateBeneficiaryAddresses(data.wills[nestIndex], setError, nestIndex, 'native')
        validateDuplicates(data.wills[nestIndex], setError, nestIndex, 'native')
        validatePercentages(data.wills[nestIndex], setError, nestIndex, 'native')

        if (Object.keys(errors).length === 0) setActiveStep((prevActiveStep) => prevActiveStep + 1)

        break

      case 1:
        validateBeneficiaryAddresses(data.wills[nestIndex], setError, nestIndex, 'tokens')
        validateContractAddresses(data.wills[nestIndex], setError, nestIndex, 'tokens')
        validateDuplicates(data.wills[nestIndex], setError, nestIndex, 'tokens')
        validatePercentages(data.wills[nestIndex], setError, nestIndex, 'tokens')

        if (Object.keys(errors).length === 0) setActiveStep((prevActiveStep) => prevActiveStep + 1)
        break

      case 2:
        validateContractAddresses(data.wills[nestIndex], setError, nestIndex, 'nfts')
        validateBeneficiaryAddresses(data.wills[nestIndex], setError, nestIndex, 'nfts')
        validateDuplicates(data.wills[nestIndex], setError, nestIndex, 'nfts')

        if (Object.keys(errors).length === 0) setActiveStep((prevActiveStep) => prevActiveStep + 1)
        break
      case 3:
        validateBeneficiaryAddresses(data.wills[nestIndex], setError, nestIndex, 'erc1155s')
        validateContractAddresses(data.wills[nestIndex], setError, nestIndex, 'erc1155s')
        validateDuplicates(data.wills[nestIndex], setError, nestIndex, 'erc1155s')
        validatePercentages(data.wills[nestIndex], setError, nestIndex, 'erc1155s')

        if (Object.keys(errors).length === 0) setActiveStep((prevActiveStep) => prevActiveStep + 1)
        break

      case 4:
        if (Object.keys(errors).length === 0) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
        break
      default:
        break
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <div>
      {nestIndex > 0 && <StyledTitle size="md">{`My Cross Chain Will ${nestIndex}`}</StyledTitle>}

      <StyledStepper orientation="vertical" activeStep={activeStep}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent transitionDuration="auto">{getStepContent(activeStep)}</StepContent>
          </Step>
        ))}
        <div>
          <Row>
            <Button style={{ marginLeft: '2rem' }} disabled={activeStep === 0} onClick={handleBack} size="md">
              Back
            </Button>

            {activeStep !== steps.length && (
              <Button style={{ marginLeft: '1rem' }} size="md" color="primary" onClick={() => handleNext(activeStep)}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </Row>
        </div>
      </StyledStepper>
    </div>
  )
}

export default MyWill
