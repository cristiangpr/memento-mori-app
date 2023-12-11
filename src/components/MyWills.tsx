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
import { BaseContract, Contract, ethers, getDefaultProvider } from 'ethers'
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
  saveWill,
  saveWillHash,
} from '../utils'
import { Container, Row, LeftColumn, RightColumn, WillForm } from './FormElements'
// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './BeneficiaryFields'
import { baseGMmAddressMmAddress, sepoliaChainSelector, sepoliaMmAddress } from '../constants'
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
  const [mm, setMm] = useState<FormTypes[]>()

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
          [Form.Cooldown]: '',
          [Form.IsActive]: true,
          [Form.RequestTime]: Math.floor(Date.now() / 1000).toString(),

          [Form.NativeToken]: [
            {
              beneficiaries: [{ address: '', percentage: null }],
            },
          ],

          [Form.Tokens]: displayData ? displayData.tokens : [],
          [Form.NFTS]: displayData ? displayData.nfts : [],
          [Form.Erc1155s]: displayData ? displayData.erc1155s : [],
          [Form.ChainSelector]: sepoliaChainSelector,
          [Form.Safe]: safe.safeAddress,
          [Form.BaseAddress]: safe.safeAddress,
          [Form.XChainAddress]: safe.safeAddress,
        },
      ],
    },
  })
  useEffect(() => {
    if (mm && mm[0].isActive) {
      setExecTime(getExecTime(mm[0]))
      if (getExecTime(mm[0]) <= Date.now()) {
        setIsExecutable(true)
      }
    }
  }, [mm, safe, sdk])
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

  const onSubmit = async (data: Forms): Promise<void> => {
    console.log('url', process.env.REACT_APP_RPC_URL)
    const sumValidated = true // await validateFieldsSum(data, setError)
    const validated = true // await validateDuplicates(data, setError)

    if (validated && sumValidated) {
      const formattedData = []
      for (let i = 0; i < data.wills.length; i += 1) {
        const formattedWill = formatData(data.wills[i], safe.safeAddress)
        formattedData.push(formattedWill)
      }

      await saveWill(formattedData)
      await saveWillHash(formattedData, sdk, safe)
      setMm(formattedData)

      /*   const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL)
      const contract = new BaseContract(sepoliaMmAddress, ABI, provider)

      contract.on('WillCreated', (ownerAddress) => {
        if (ethers.utils.getAddress(ownerAddress) === ethers.utils.getAddress(safe.safeAddress)) {
          setSuccess(true)
          setIsCreateOpen(false)
          /* reset({
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
    
      }) */
    }
  }
  const handleDelete = async (): Promise<void> => {
    setSuccess(false)
    setIsDeleteOpen(true)
    await deleteWill(sdk)
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    contract.on('WillDeleted', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsDeleteOpen(true)
        reset({
          wills: [
            {
              cooldown: null,
              native: [],
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
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
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
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    contract.on('ExecutionCancelled', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsCancelOpen(true)
      }
    })
  }
  const handleExecute = async (wills: FormTypes[]): Promise<void> => {
    await executeWill(sdk, wills)
    /* const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    contract.on('WillExecuted', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsExecuteOpen(true)
      }
    }) */
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
      {console.log(mm)}
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

      <WillForm onSubmit={handleSubmit(onSubmit)}>
        {willFields.map((element, index) => {
          console.log(willFields)
          return (
            <MyWill key={element.id} nestIndex={index} control={control} errors={errors} clearErrors={clearErrors} />
          )
        })}
        <Row style={{ justifyContent: 'center' }}>
          <Button
            size="md"
            onClick={() =>
              appendWill({
                cooldown: '0',
                isActive: false,
                requestTime: '0',
                native: [
                  {
                    beneficiaries: [{ address: '', percentage: null }],
                  },
                ],
                tokens: [],
                nfts: [],
                erc1155s: [],
                executors: [],
                chainSelector: '',
                safe: '',
                baseAddress: safe.safeAddress,
                xChainAddress: baseGMmAddressMmAddress,
              })
            }
          >
            Add Cross Chain Will
          </Button>
        </Row>
        {willFields.length > 1 && (
          <Row style={{ justifyContent: 'center' }}>
            <Button size="md" onClick={() => removeWill(willFields.length - 1)}>
              Remove Cross Chain Will
            </Button>
          </Row>
        )}

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
            <Button size="md" onClick={() => handleExecute(mm)}>
              Execute Will
            </Button>
          </Row>
        )}
      </WillForm>
    </Container>
  )
}

export default MyWills
