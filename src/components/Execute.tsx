/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Title, Button, TextFieldInput, GenericModal, Loader, Dot, Icon, Text } from '@gnosis.pm/safe-react-components'
import { BaseContract, ethers, JsonRpcProvider } from 'ethers'
import {
  executeWill,
  formatDataForContract,
  formatDataForApi,
  getDisplayData,
  getExecTime,
  getIsExecutor,
  getWills,
  requestExecution,
  saveWillHash,
  setRequestTime,
} from '../utils'
import { FormTypes, Forms, TransactionStatus, TransactionType } from '../types'
import { Container, LeftColumn, RightColumn, Row, Will, WillForm, StyledInput, StyledTitle } from './FormElements'
import { sepoliaMmAddress } from '../constants'
import ABI from '../abis/mementoMori.json'
import { Modal } from './Modal'

function Execute(): React.ReactElement {
  const [displayData, setDisplayData] = useState<FormTypes[]>()
  const [ownerAddress, setOwnerAddress] = useState<string>()
  const [isExecutor, setIsExecutor] = useState<boolean>(false)
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.Request)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(TransactionStatus.Success)

  const { safe, sdk } = useSafeAppsSDK()

  const loadData = async (): Promise<void> => {
    const data = await getWills(ownerAddress)
    console.log('data', data)
    if (data && data.length > 0) {
      const display = getDisplayData(data)
      setDisplayData(display)
    } else {
      setDisplayData(undefined)
    }
    setHasSearched(true)
  }
  const handleRequest = async (): Promise<void> => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract: BaseContract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setTransactionType(TransactionType.Request)
    setTransactionStatus(TransactionStatus.Executing)
    setIsOpen(true)
    const requestTime = Math.floor(Date.now() / 1000).toString()
    const formattedData = []
    for (let i = 0; i < displayData.length; i += 1) {
      const formattedWill = formatDataForContract(displayData[i], safe.safeAddress, requestTime)
      formattedData.push(formattedWill)
    }
    await requestExecution(formattedData, sdk)
    contract.on('ExecutionRequested', async (address) => {
      if (ownerAddress === address) {
        await setRequestTime(ownerAddress, safe, requestTime)
        setTransactionStatus(TransactionStatus.Success)
        setIsOpen(true)
      }
    })

    await loadData
    displayData[0].isActive = true
    displayData[0].requestTime = requestTime
  }
  const handleExecute = async () => {
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
    console.log('exec', formattedData)

    await executeWill(sdk, formattedData)

    contract.on('WillExecuted', (address) => {
      if (ownerAddress === address) {
        setTransactionStatus(TransactionStatus.Success)
        setIsOpen(true)
      }
    })
  }
  const handleClose = (): void => {
    setIsOpen(false)
  }

  useEffect(() => {
    if (displayData) {
      setIsExecutor(getIsExecutor(displayData[0], safe))
    }
    if (displayData && displayData[0].isActive) {
      setExecTime(getExecTime(displayData[0]))
      if (getExecTime(displayData[0]) <= Date.now()) {
        setIsExecutable(true)
      }
    }
  }, [displayData, safe])

  return (
    <Container>
      <Modal
        isOpen={isOpen}
        transactionStatus={transactionStatus}
        transactionType={transactionType}
        handleClose={handleClose}
        execTime={execTime}
      />

      <StyledTitle size="lg">Execute</StyledTitle>
      <StyledTitle size="sm">Enter owner address to find will and request execution</StyledTitle>
      <Row style={{ width: '50%', padding: '1rem' }}>
        <StyledInput
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          name="ownerAddress"
          label="owner address"
        />
      </Row>
      <div>
        <Button size="md" onClick={() => loadData()}>
          Find Will
        </Button>
      </div>
      {displayData && displayData.length > 0 ? (
        <>
          {displayData.map((will, index) => {
            return (
              <>
                <StyledTitle size="lg">{`Will ${index + 1}`}</StyledTitle>
                <Will>
                  {console.log('will', will)}
                  {console.log('request', displayData)}
                  <StyledTitle size="md">Cooldown Period</StyledTitle>
                  <Text size="sm">{will.cooldown.toString()}</Text>
                  <StyledTitle size="md">Chain Selector</StyledTitle>
                  <Text size="sm">{will.chainSelector.toString()}</Text>
                  <StyledTitle size="md">Native Token</StyledTitle>
                  {will.native[0].beneficiaries.map((element) => {
                    return (
                      <Row>
                        <LeftColumn>
                          <StyledTitle size="sm">Beneficiary</StyledTitle>
                          <Text size="sm">{element.address}</Text>
                        </LeftColumn>
                        <RightColumn>
                          <StyledTitle size="sm">Percentage</StyledTitle>
                          <Text size="sm">{element.percentage.toString()}</Text>
                        </RightColumn>
                      </Row>
                    )
                  })}
                  {will.tokens.length > 0 ? <StyledTitle size="md">ERC20 Tokens</StyledTitle> : null}

                  {will.tokens?.map((token, i) => {
                    // eslint-disable-next-line no-lone-blocks
                    {
                      console.log('displayData', displayData)
                    }
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <StyledTitle size="sm">TokenAddress </StyledTitle>
                        </Row>
                        <Row>
                          <Text size="sm">{token.contractAddress}</Text>
                        </Row>
                        {token.beneficiaries.map((element) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <StyledTitle size="sm">Beneficiary</StyledTitle>
                                <Text size="sm">{element.address}</Text>
                              </LeftColumn>
                              <LeftColumn>
                                <StyledTitle size="sm">Percentage</StyledTitle>
                                <Text size="sm">{element.percentage.toString()}</Text>
                              </LeftColumn>
                            </Row>
                          )
                        })}
                      </div>
                    )
                  })}
                  {will.nfts.length > 0 ? <StyledTitle size="md">ERC721 NFTs</StyledTitle> : null}
                  {will.nfts?.map((nft, i) => {
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <StyledTitle size="sm">TokenAddress </StyledTitle>
                        </Row>
                        <Row>
                          <Text size="sm">{nft.contractAddress}</Text>
                        </Row>
                        {nft.beneficiaries.map((element) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <StyledTitle size="sm">Token Id</StyledTitle>
                                <Text size="sm">{element.tokenId.toString()}</Text>
                              </LeftColumn>
                              <RightColumn>
                                <StyledTitle size="sm">Beneficiary</StyledTitle>
                                <Text size="sm">{element.address}</Text>
                              </RightColumn>
                            </Row>
                          )
                        })}
                      </div>
                    )
                  })}
                  {will.erc1155s.length > 0 ? <StyledTitle size="md">ERC1155 Tokens</StyledTitle> : null}
                  {will.erc1155s?.map((erc1155, i) => {
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <LeftColumn>
                            <StyledTitle size="sm">Token Address</StyledTitle>
                            <Text size="sm">{erc1155.contractAddress}</Text>
                          </LeftColumn>
                          <RightColumn>
                            <StyledTitle size="sm">Token Id</StyledTitle>
                            <Text size="sm">{erc1155.tokenId.toString()}</Text>
                          </RightColumn>
                        </Row>
                        {erc1155.beneficiaries.map((element) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <StyledTitle size="sm">Beneficiary</StyledTitle>
                                <Text size="sm">{element.address}</Text>
                              </LeftColumn>
                              <RightColumn>
                                <Text size="sm">{element.percentage.toString()}</Text>
                              </RightColumn>
                            </Row>
                          )
                        })}
                      </div>
                    )
                  })}
                </Will>
              </>
            )
          })}

          {isExecutor && !isExecutable && (
            <div style={{ padding: '20px' }}>
              <Button size="md" color="primary" onClick={() => handleRequest()}>
                Request Execution
              </Button>
            </div>
          )}
          {execTime && (
            <div style={{ padding: '20px' }}>
              <Text size="sm">Will executable after {new Date(execTime * 1000).toLocaleString()}</Text>
              {console.log('exec', execTime)}
            </div>
          )}
          {isExecutable && (
            <div style={{ padding: '20px' }}>
              <Button size="md" color="primary" onClick={() => handleExecute()}>
                Execute Will
              </Button>
            </div>
          )}
        </>
      ) : hasSearched ? (
        <StyledTitle size="md">Will not found</StyledTitle>
      ) : null}
    </Container>
  )
}

export default Execute
