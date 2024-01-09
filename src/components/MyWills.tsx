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
import { BaseContract, Contract, ethers, getAddress, getDefaultProvider, JsonRpcProvider } from 'ethers'
import { useSafeBalances } from '../hooks/useSafeBalances'
import BalancesTable from './BalancesTable'
import { ContractWill, Form, FormTypes, Forms } from '../types'
import {
  cancelExecution,
  deleteWill,
  executeWill,
  formatDataForApi,
  formatDataForContract,
  getDisplayData,
  getExecTime,
  getWills,
  requestExecution,
  saveWill,
  saveWillHash,
} from '../utils'
import { Container, Row, LeftColumn, RightColumn, WillForm } from './FormElements'
// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './BeneficiaryFields'
import { baseGChainSelector, baseGMmAddress, sepoliaChainSelector, sepoliaMmAddress } from '../constants'
import ABI from '../abis/mementoMori.json'
import { validateDuplicates, validateFieldsSum } from '../validation'
import MyWill from './MyWill'

function MyWills(): React.ReactElement {
  const { sdk, safe } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
  const [displayData, setDisplayData] = useState<FormTypes[]>()
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
          [Form.IsActive]: false,
          [Form.RequestTime]: '0',

          [Form.Native]: [
            {
              beneficiaries: [{ address: '', percentage: null }],
            },
          ],

          [Form.Tokens]: [],
          [Form.NFTS]: [],
          [Form.Erc1155s]: [],
          [Form.ChainSelector]: sepoliaChainSelector,
          [Form.Safe]: safe.safeAddress,
          [Form.BaseAddress]: safe.safeAddress,
          [Form.XChainAddress]: safe.safeAddress,
          [Form.Executed]: false,
        },
      ],
    },
  })
  const {
    fields: willFields,
    append: appendWill,
    remove: removeWill,
  } = useFieldArray({
    control,
    name: 'wills',
  })

  useEffect(() => {
    const loadData = async () => {
      const data = await getWills(safe.safeAddress)
      console.log('data', data)
      if (data.length > 0) {
        const display = getDisplayData(data)
        setDisplayData(display)
        setHasWill(true)

        if (displayData && displayData[0].isActive) {
          setExecTime(getExecTime(displayData[0]))
          if (getExecTime(displayData[0]) <= Date.now()) {
            setIsExecutable(true)
          }
        }
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (hasWill && displayData) {
      console.log('display', displayData)
      reset({
        wills: [
          {
            [Form.Cooldown]: displayData[0].cooldown,
            [Form.IsActive]: displayData[0].isActive,
            [Form.RequestTime]: displayData[0].requestTime,

            [Form.Native]: displayData[0].native,
            [Form.Executors]: displayData[0].executors,
            [Form.Tokens]: displayData[0].tokens,
            [Form.NFTS]: displayData[0].nfts,
            [Form.Erc1155s]: displayData[0].erc1155s,
            [Form.ChainSelector]: sepoliaChainSelector,
            [Form.Safe]: safe.safeAddress,
            [Form.BaseAddress]: safe.safeAddress,
            [Form.XChainAddress]: safe.safeAddress,
            [Form.Executed]: displayData[0].executed,
            [Form.Id]: displayData[0].id,
          },
        ],
      })

      if (displayData && displayData.length > 1) {
        console.log('length', displayData.length)
        for (let i = 1; i < displayData.length; i += 1) {
          console.log('i', displayData[i])
          appendWill({
            [Form.Cooldown]: displayData[i].cooldown,
            [Form.IsActive]: displayData[i].isActive,
            [Form.RequestTime]: displayData[i].requestTime,
            [Form.Executors]: displayData[i].executors,
            [Form.Native]: displayData[i].native,

            [Form.Tokens]: displayData[i].tokens,
            [Form.NFTS]: displayData[i].nfts,
            [Form.Erc1155s]: displayData[i].erc1155s,
            [Form.ChainSelector]: displayData[i].chainSelector,
            [Form.Safe]: displayData[i].safe,
            [Form.BaseAddress]: displayData[i].baseAddress,
            [Form.XChainAddress]: displayData[i].xChainAddress,
            [Form.Executed]: displayData[i].executed,
            [Form.Id]: displayData[i].id,
          })
        }
      }
    }
  }, [reset, hasWill, displayData, safe.safeAddress, appendWill])

  const onSubmit = async (data: Forms): Promise<void> => {
    setSuccess(false)
    setIsCreateOpen(true)
    console.log('url', process.env.REACT_APP_RPC_URL)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    const sumValidated = validateFieldsSum(data.wills, setError)
    const validated = validateDuplicates(data.wills, setError)

    if (validated && sumValidated) {
      const apiData = []
      const contractData = []
      for (let i = 0; i < data.wills.length; i += 1) {
        const apiWill = formatDataForApi(data.wills[i], safe.safeAddress)
        apiData.push(apiWill)
        const contractWill = formatDataForContract(data.wills[i], safe.safeAddress)
        contractData.push(contractWill)
      }

      await saveWill(apiData)

      await saveWillHash(contractData, sdk, safe)

      contract.on('WillCreated', (ownerAddress) => {
        if (getAddress(ownerAddress) === getAddress(safe.safeAddress)) {
          setSuccess(true)
          setIsCreateOpen(true)
        }
      })
    }
  }
  const handleDelete = async (): Promise<void> => {
    setSuccess(false)
    setIsDeleteOpen(true)
    await deleteWill(sdk)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
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

  const handleCancel = async (): Promise<void> => {
    setSuccess(false)
    setIsCancelOpen(true)
    await cancelExecution(sdk)
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    contract.on('ExecutionCancelled', (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        setSuccess(true)
        setIsCancelOpen(true)
      }
    })
  }
  const handleExecute = async () => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setSuccess(false)
    setIsExecuteOpen(true)
    const formattedData = []
    for (let i = 0; i < displayData.length; i += 1) {
      const formattedWill = formatDataForContract(displayData[i], safe.safeAddress)
      formattedData.push(formattedWill)
    }

    await executeWill(sdk, formattedData)

    contract.on('WillExecuted', (address) => {
      if (safe.safeAddress === address) {
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

      <WillForm onSubmit={handleSubmit(onSubmit)}>
        {willFields.map((element, index) => {
          console.log('willfields', willFields)
          console.log('errors', errors)
          return (
            <MyWill key={element.id} nestIndex={index} control={control} errors={errors} clearErrors={clearErrors} />
          )
        })}
        <Row style={{ justifyContent: 'center' }}>
          <Button
            size="md"
            color="secondary"
            onClick={() =>
              appendWill({
                [Form.Cooldown]: '0',
                [Form.IsActive]: false,
                [Form.RequestTime]: '0',

                [Form.Native]: displayData[0].native,
                [Form.Executors]: [],
                [Form.Tokens]: [],
                [Form.NFTS]: [],
                [Form.Erc1155s]: [],
                [Form.ChainSelector]: baseGChainSelector,
                [Form.Safe]: '',
                [Form.BaseAddress]: safe.safeAddress,
                [Form.XChainAddress]: baseGMmAddress,
                [Form.Executed]: false,
              })
            }
          >
            Add Cross Chain Will
          </Button>
        </Row>
        {willFields.length > 1 && (
          <Row style={{ justifyContent: 'center' }}>
            <Button size="md" color="secondary" onClick={() => removeWill(willFields.length - 1)}>
              Remove Cross Chain Will
            </Button>
          </Row>
        )}

        <Row style={{ justifyContent: 'center' }}>
          <Button size="md" color="secondary" type="submit">
            {hasWill ? 'Update Will' : 'Create Will'}
          </Button>
        </Row>

        {hasWill && (
          <Row style={{ justifyContent: 'center' }}>
            <Button size="md" color="error" onClick={() => handleDelete()}>
              Delete Will
            </Button>
          </Row>
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
