/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Title, Button, TextFieldInput, Stepper, Text } from '@gnosis.pm/safe-react-components'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { BaseContract, getAddress, getDefaultProvider, JsonRpcProvider } from 'ethers'
import { useSafeBalances } from '../hooks/useSafeBalances'
import { Form, FormTypes, Forms, TransactionType, TransactionStatus } from '../types'
import {
  cancelExecution,
  deleteWill,
  deleteWillHash,
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
import { Container, Row, LeftColumn, RightColumn, WillForm, StyledTitle } from './FormElements'
import { baseSepoliaChainSelector, baseSepoliaMmAddress, sepoliaChainSelector, sepoliaMmAddress } from '../constants'
import ABI from '../abis/mementoMori.json'

import MyWill from './MyWill'
import { Modal } from './Modal'
import { useApiGet, useApiSend } from '../api'

function MyWills(): React.ReactElement {
  const { sdk, safe } = useSafeAppsSDK()
  const [balances] = useSafeBalances(sdk)
  const [displayData, setDisplayData] = useState<FormTypes[]>()
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()
  const [hasWill, setHasWill] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.Create)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(TransactionStatus.Confirm)
  const [isReady, setIsReady] = useState<boolean>(false)

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
  } = useFormContext()
  const {
    fields: willFields,
    append: appendWill,
    remove: removeWill,
  } = useFieldArray({
    control,
    name: 'wills',
  })

  const { data } = useApiGet(['wills'], getWills, {
    enabled: true,
    refetchOnWindowFocus: true,
    retry: 1,
  })
  const { mutate } = useApiSend(saveWill, null, () => setTransactionStatus(TransactionStatus.Failure))
  const memoizedDisplayData = useMemo(() => {
    if (data) {
      return data as FormTypes[]
    }
    return []
  }, [data])
  useEffect(() => {
    if (memoizedDisplayData) {
      setDisplayData(memoizedDisplayData)
      setHasWill(true)
    }
  }, [memoizedDisplayData])
  useEffect(() => {
    if (hasWill && displayData) {
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
        for (let i = 1; i < displayData.length; i += 1) {
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

  const onSubmit = () => {
    setIsOpen(true)
    setTransactionStatus(TransactionStatus.Confirm)
  }

  const handleSave = useCallback(
    async (formData: Forms): Promise<void> => {
      if (hasWill) {
        setTransactionType(TransactionType.Update)
      } else {
        setTransactionType(TransactionType.Create)
      }
      setTransactionStatus(TransactionStatus.Executing)
      setIsOpen(true)

      const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
      const contract = new BaseContract(sepoliaMmAddress, ABI, provider)

      const validated = Object.keys(errors).length === 0

      if (validated) {
        const apiData = []
        const contractData = []
        for (let i = 0; i < formData.wills.length; i += 1) {
          const apiWill = formatDataForApi(formData.wills[i], safe.safeAddress)
          apiData.push(apiWill)
          const contractWill = formatDataForContract(formData.wills[i], safe.safeAddress)
          contractData.push(contractWill)
        }

        await saveWillHash(contractData, sdk, safe, transactionType)
        if (transactionType === TransactionType.Create) {
          contract.on('WillCreated', async (ownerAddress) => {
            if (getAddress(ownerAddress) === getAddress(safe.safeAddress)) {
              mutate({
                content: apiData,
              })
              setTransactionStatus(TransactionStatus.Success)
              setIsOpen(true)
            }
          })
        } else {
          contract.on('WillUpdated', async (ownerAddress) => {
            if (getAddress(ownerAddress) === getAddress(safe.safeAddress)) {
              await saveWill(apiData)
              setTransactionStatus(TransactionStatus.Success)
              setIsOpen(true)
            }
          })
        }
      }
    },
    [errors, hasWill, mutate, safe, sdk, transactionType],
  )
  const handleDelete = useCallback(async (): Promise<void> => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setTransactionType(TransactionType.Delete)
    setTransactionStatus(TransactionStatus.Executing)
    setIsOpen(true)
    await deleteWillHash(sdk)

    contract.on('WillDeleted', async (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        await deleteWill(displayData)
        setTransactionStatus(TransactionStatus.Success)
        setIsOpen(true)
        setHasWill(false)
        reset({
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
        })
      }
    })
  }, [displayData, reset, safe.safeAddress, sdk])

  const handleCancel = useCallback(async (): Promise<void> => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setTransactionType(TransactionType.Cancel)
    setTransactionStatus(TransactionStatus.Executing)
    setIsOpen(true)
    const contractData = []
    for (let i = 0; i < displayData.length; i += 1) {
      const contractWill = formatDataForContract(displayData[i], safe.safeAddress, '0')
      contractData.push(contractWill)
    }

    await saveWillHash(contractData, sdk, safe, transactionType)
    contract.on('ExecutionCancelled', async (ownerAddress) => {
      if (ownerAddress === safe.safeAddress) {
        await cancelExecution(displayData[0])
        setTransactionStatus(TransactionStatus.Success)
        setIsOpen(true)
        setIsExecutable(false)
      }
    })
  }, [displayData, safe, sdk, transactionType])
  const handleExecute = useCallback(async () => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setTransactionType(TransactionType.Execute)
    setTransactionStatus(TransactionStatus.Executing)
    setIsOpen(true)
    const formattedData = []
    for (let i = 0; i < displayData.length; i += 1) {
      const formattedWill = formatDataForContract(displayData[i], safe.safeAddress)
      formattedData.push(formattedWill)
    }

    await executeWill(sdk, formattedData)

    contract.on('WillExecuted', (address) => {
      if (safe.safeAddress === address) {
        setTransactionStatus(TransactionStatus.Success)
        setIsOpen(true)
      }
    })
  }, [displayData, safe.safeAddress, sdk])
  const handleScroll = (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Container>
      <div style={{ justifyContent: 'right' }}>
        <Modal
          isOpen={isOpen}
          transactionStatus={transactionStatus}
          transactionType={transactionType}
          handleClose={handleClose}
          hasWill={hasWill}
          execTime={execTime}
          handleSave={handleSubmit(handleSave)}
        />
      </div>

      <StyledTitle size="xl">{hasWill ? 'My Will' : 'Create Will'}</StyledTitle>
      <Row style={{ width: '65%' }}>
        <Text size="md">
          {hasWill
            ? 'Below is your current will. You may add or delete tokens by using the form and clicking the "Update Will" button to save changes. You may also delete the will or request execution by owner by clcking the appropriate buttons.'
            : 'Follow the steps below to create a will. Make sure at least one beneficiary is a Safe so they may request execution using this app. Non Safe addresses may request execution by interacting directly with the contract.'}
        </Text>
      </Row>

      <WillForm onSubmit={handleSubmit(onSubmit)}>
        {willFields.map((element, index) => {
          return (
            <MyWill
              key={element.id}
              nestIndex={index}
              setIsOpen={setIsOpen}
              setIsReady={setIsReady}
              hasWill={hasWill}
            />
          )
        })}
        <Row style={{ justifyContent: 'center' }}>
          <Button size="md" type="submit" disabled={!isReady}>
            {hasWill ? 'Update Will' : 'Create Will'}
          </Button>
        </Row>
        <Row style={{ justifyContent: 'center' }}>
          <Button
            size="md"
            onClick={() =>
              appendWill({
                [Form.Cooldown]: '0',
                [Form.IsActive]: false,
                [Form.RequestTime]: '0',

                [Form.Native]: [
                  {
                    beneficiaries: [{ address: '', percentage: null }],
                  },
                ],
                [Form.Executors]: [],
                [Form.Tokens]: [],
                [Form.NFTS]: [],
                [Form.Erc1155s]: [],
                [Form.ChainSelector]: baseSepoliaChainSelector,
                [Form.Safe]: '',
                [Form.BaseAddress]: safe.safeAddress,
                [Form.XChainAddress]: baseSepoliaMmAddress,
                [Form.Executed]: false,
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
              <Text size="sm">Will executable after {new Date(execTime * 1000).toLocaleString()}</Text>
            </Row>
            <Row style={{ justifyContent: 'center' }}>
              <Button size="md" color="error" onClick={() => handleCancel()}>
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
