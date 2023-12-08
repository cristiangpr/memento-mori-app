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
import { DisplayData, Form, FormTypes, Forms } from '../types'
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
import MyWill from './MyWill'

function MyWills(): React.ReactElement {
  const { sdk, safe } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
  const [displayData, setDisplayData] = useState<DisplayData>()
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()
  const [hasWill, setHasWill] = useState<boolean>(false)
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false)
  const [isExecuteOpen, setIsExecuteOpen] = useState<boolean>(false)
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    watch,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<Forms>({
    defaultValues: {
      wills: [
        {
          [Form.Cooldown]: null,

          [Form.NativeToken]: [
            {
              beneficiaries: [{ address: '', percentage: null }],
            },
          ],

          [Form.Tokens]: displayData ? displayData.tokens : [],
          [Form.NFTS]: displayData ? displayData.nfts : [],
          [Form.Erc1155s]: displayData ? displayData.erc1155s : [],
        },
      ],
    },
  })
  /* useEffect(() => {
    const loadData = async () => {
      const data = await getWill(safe.safeAddress, sdk)
      setDisplayData(data)
      if (displayData && displayData.executors.length > 0) {
        setHasWill(true)
      }
      if (displayData && displayData.isActive) {
        setExecTime(getExecTime(displayData))
        if (getExecTime(displayData) <= Date.now()) {
          setIsExecutable(true)
        }
      }
    }
    loadData()
  }, [displayData, safe, sdk])
  useEffect(() => {
    if (hasWill) {
      reset({
        cooldown: Number(displayData.cooldown),
        nativeToken: [displayData.nativeToken],
        tokens: displayData.tokens,
        nfts: displayData.nfts,
        erc1155s: displayData.erc1155s,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, hasWill]) */

  const {
    fields: willFields,
    append: appendWill,
    remove: removeWill,
  } = useFieldArray({
    control,
    name: 'wills',
  })

  /* const onSubmit = async (data): Promise<void> => {
    console.log('url', process.env.REACT_APP_RPC_URL)
    const sumValidated = await validateFieldsSum(data, setError)
    const validated = await validateDuplicates(data, setError)
    if (validated && sumValidated) {
      const newData = formatData(data, safe.safeAddress)
      setIsCreateOpen(true)
      await createWill(newData, sdk, safe)
      const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
      const contract = new BaseContract(MM_ADDRESS, ABI, provider)
      contract.on('WillCreated', (ownerAddress) => {
        console.log('event', ownerAddress)
        if (getAddress(ownerAddress) === getAddress(safe.safeAddress)) {
          setSuccess(true)
          setIsCreateOpen(true)
          reset({
            wills: [
              {
                cooldown: Number(displayData.cooldown),
                nativeToken: [displayData.nativeToken],
                tokens: displayData.tokens,
                nfts: displayData.nfts,
                erc1155s: displayData.erc1155s,
              },
            ],
          })
        }
      })
    }
  } */
  const handleDelete = async (): Promise<void> => {
    setSuccess(false)
    setIsDeleteOpen(true)
    await deleteWill(sdk)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(MM_ADDRESS, ABI, provider)
    contract.on('WillDeleted', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsDeleteOpen(true)
        reset({
          wills: [
            {
              cooldown: null,
              nativeToken: [],
              tokens: [],
              nfts: [],
              erc1155s: [],
            },
          ],
        })
      }
    })
  }
  const handleRequest = async (): Promise<void> => {
    setSuccess(false)
    setIsRequestOpen(true)
    await requestExecution(safe.safeAddress, sdk)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(MM_ADDRESS, ABI, provider)
    contract.on('ExecutionRequested', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsRequestOpen(true)
      }
    })
  }
  const handleCancel = async (): Promise<void> => {
    setSuccess(false)
    setIsCancelOpen(true)
    await cancelExecution(sdk)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(MM_ADDRESS, ABI, provider)
    contract.on('ExecutionCancelled', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsCancelOpen(true)
      }
    })
  }
  const handleExecute = async (): Promise<void> => {
    setSuccess(false)
    setIsExecuteOpen(true)
    await executeWill(sdk, safe.safeAddress)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(MM_ADDRESS, ABI, provider)
    contract.on('WillExecuted', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsExecuteOpen(true)
      }
    })
  }
  const handleScroll = (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }
  const handleCreateClose = () => {
    setIsCreateOpen(false)
    setSuccess(false)
  }
  const handleDeleteClose = () => {
    setIsDeleteOpen(false)
    setSuccess(false)
  }
  const handleRequestClose = () => {
    setIsRequestOpen(false)
    setSuccess(false)
  }
  const handleCancelClose = () => {
    setIsCancelOpen(false)
    setSuccess(false)
  }
  const handleExecuteClose = () => {
    setIsExecuteOpen(false)
    setSuccess(false)
  }
  return (
    <Container>
      {isCreateOpen && (
        <div style={{ justifyContent: 'right' }}>
          <GenericModal
            title={
              hasWill && !success
                ? 'Updating Will'
                : !hasWill && !success
                ? 'Creating Will'
                : hasWill && success
                ? 'Will Updated'
                : 'Will Created'
            }
            body={
              !success ? (
                <div style={{ paddingLeft: '11.875rem' }}>
                  <Loader size="lg" />
                </div>
              ) : (
                <div style={{ paddingLeft: '12.875rem' }}>
                  <Dot color="primary">
                    <Icon color="white" type="check" size="sm" />
                  </Dot>
                </div>
              )
            }
            onClose={() => handleCreateClose()}
          />
        </div>
      )}
      {isDeleteOpen && (
        <GenericModal
          title={!success ? 'Deleting Will' : 'Will Deleted'}
          body={
            !success ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="sm" />
                </Dot>
              </div>
            )
          }
          onClose={() => handleDeleteClose()}
        />
      )}
      {isRequestOpen && (
        <GenericModal
          title={!success ? 'Requesting Execution' : 'Execution Requested'}
          body={
            !success ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="sm" />
                </Dot>
                <div>Will executable after {new Date(execTime * 1000).toLocaleString()}</div>
              </div>
            )
          }
          onClose={() => handleRequestClose()}
        />
      )}
      {isCancelOpen && (
        <GenericModal
          title={!success ? 'Cancelling Execution' : 'Execution Cancelled'}
          body={
            !success ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="sm" />
                </Dot>
              </div>
            )
          }
          onClose={() => handleCancelClose()}
        />
      )}
      {isExecuteOpen && (
        <GenericModal
          title={!success ? 'Executing Will' : 'Will Executed'}
          body={
            !success ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="sm" />
                </Dot>
              </div>
            )
          }
          onClose={() => handleExecuteClose()}
        />
      )}
      <Title size="lg">Memento Mori</Title>
      <Row style={{ width: '65%' }}>
        Memento Mori is an app that lets you create a will for your Safe. Beneficiaries of a will may request execution.
        If execution is not canceled by the Safe owner during the cooldown period the will may be executed
      </Row>

      <Title size="md">{hasWill ? 'My Will' : 'Create Will'}</Title>
      <Row style={{ width: '65%' }}>
        {hasWill
          ? 'Below is your current will. You may add or delete tokens by using the form and clicking the "Update Will" button to save changes. You may also delete the will or request execution by owner by clcking the appropriate buttons.'
          : 'Follow the steps below to create a will. Make sure at least one beneficiary is a Safe so they may request execution using this app. Non Safe addresses may request execution by interacting directly with the contract.'}
      </Row>

      <WillForm>
        {willFields.map((element, index) => {
          return <MyWill nestIndex={index} control={control} errors={errors} clearErrors={clearErrors} />
        })}
        <Row style={{ justifyContent: 'center' }}>
          <Button
            size="md"
            onClick={() =>
              appendWill({
                cooldown: null,
                nativeToken: [],
                tokens: [],
                nfts: [],
                erc1155s: [],
                executors: [],
              })
            }
          >
            Add Token
          </Button>
        </Row>

        <Row style={{ justifyContent: 'center' }}>
          <Button size="md" type="submit">
            {hasWill ? 'Update Will' : 'Create Will'}
          </Button>
        </Row>

        {hasWill && (
          <>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" onClick={() => handleDelete()}>
                Delete Will
              </Button>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" onClick={() => handleRequest()}>
                Request Execution
              </Button>
            </Row>
          </>
        )}

        {execTime && (
          <>
            <Row style={{ justifyContent: 'center' }}>
              <div>Will executable after {new Date(execTime * 1000).toLocaleString()}</div>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" onClick={() => handleCancel()}>
                Cancel Execution
              </Button>
            </Row>
          </>
        )}
        {isExecutable && (
          <Row style={{ justifyContent: 'center' }}>
            <Button size="md" onClick={() => handleExecute()}>
              Execute Will
            </Button>
          </Row>
        )}
      </WillForm>
    </Container>
  )
}

export default MyWills
