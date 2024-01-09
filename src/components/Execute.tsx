/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Title, Button, TextFieldInput, GenericModal, Loader, Dot, Icon } from '@gnosis.pm/safe-react-components'
import { BaseContract, ethers, JsonRpcProvider } from 'ethers'
import {
  executeWill,
  formatData,
  getDisplayData,
  getExecTime,
  getIsExecutor,
  getWills,
  requestExecution,
  saveWillHash,
} from '../utils'
import { DisplayData, FormTypes, Forms } from '../types'
import { Container, LeftColumn, RightColumn, Row, Will, WillForm } from './FormElements'
import { sepoliaMmAddress } from '../constants'
import ABI from '../abis/mementoMori.json'

function Execute(): React.ReactElement {
  const [displayData, setDisplayData] = useState<FormTypes[]>()
  const [ownerAddress, setOwnerAddress] = useState<string>()
  const [isExecutor, setIsExecutor] = useState<boolean>(false)
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()
  const [isRequestOpen, setIsRequestOpen] = useState<boolean>(false)
  const [isExecuteOpen, setIsExecuteOpen] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)

  const { safe, sdk } = useSafeAppsSDK()

  const loadData = async (): Promise<void> => {
    const data = await getWills(ownerAddress)
    const display = getDisplayData(data)
    setDisplayData(display)
    setHasSearched(true)
  }
  const handleRequest = async (): Promise<void> => {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL)
    const contract: BaseContract = new BaseContract(sepoliaMmAddress, ABI, provider)
    setSuccess(false)
    setIsRequestOpen(true)
    await requestExecution(ownerAddress, safe)
    await loadData()
    const formattedData = []
    for (let i = 0; i < displayData.length; i += 1) {
      const formattedWill = formatData(displayData[i], safe.safeAddress)
      formattedData.push(formattedWill)
    }
    await saveWillHash(formattedData, sdk, safe)

    contract.on('WillCreated', (address) => {
      if (ownerAddress === address) {
        setSuccess(true)
        setIsRequestOpen(true)
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
      const formattedWill = formatData(displayData[i], safe.safeAddress)
      formattedData.push(formattedWill)
    }

    await executeWill(sdk, formattedData)

    contract.on('WillExecuted', (address) => {
      if (ownerAddress === address) {
        setSuccess(true)
        setIsExecuteOpen(true)
      }
    })
  }
  const handleRequestClose = (): void => {
    setIsRequestOpen(false)
    setSuccess(false)
  }
  const handleExecuteClose = (): void => {
    setIsExecuteOpen(false)
    setSuccess(false)
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
      <Title size="lg">Execute</Title>
      <Title size="sm">Enter owner address to find will and request execution</Title>
      <Row style={{ width: '50%', padding: '1rem' }}>
        <TextFieldInput
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
                <Title size="lg">{`Will ${index + 1}`}</Title>
                <Will>
                  {console.log('will', will)}

                  <Title size="md">Cooldown Period</Title>
                  <div>{will.cooldown.toString()}</div>
                  <Title size="md">Chain Selector</Title>
                  <div>{will.chainSelector.toString()}</div>
                  <Title size="md">Native Token</Title>
                  {will.native[0].beneficiaries.map((element) => {
                    return (
                      <Row>
                        <LeftColumn>
                          <Title size="sm">Beneficiary</Title>
                          <div>{element.address}</div>
                        </LeftColumn>
                        <RightColumn>
                          <Title size="sm">Percentage</Title>
                          <div>{element.percentage.toString()}</div>
                        </RightColumn>
                      </Row>
                    )
                  })}
                  {will.tokens.length > 0 ? <Title size="md">ERC20 Tokens</Title> : null}

                  {will.tokens?.map((token, i) => {
                    // eslint-disable-next-line no-lone-blocks
                    {
                      console.log('displayData', displayData)
                    }
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <Title size="sm">TokenAddress </Title>
                        </Row>
                        <Row>
                          <div>{token.contractAddress}</div>
                        </Row>
                        {token.beneficiaries.map((item) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <Title size="sm">Beneficiary</Title>
                                {item.address}
                              </LeftColumn>
                              <LeftColumn>
                                <Title size="sm">Percentage</Title>
                                {item.percentage.toString()}
                              </LeftColumn>
                            </Row>
                          )
                        })}
                      </div>
                    )
                  })}
                  {will.nfts.length > 0 ? <Title size="md">ERC721 NFTs</Title> : null}
                  {will.nfts?.map((nft, i) => {
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <Title size="sm">TokenAddress </Title>
                        </Row>
                        <Row>
                          <div>{nft.contractAddress}</div>
                        </Row>
                        {nft.beneficiaries.map((item) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <Title size="sm">Token Id</Title>
                                {item.tokenId.toString()}
                              </LeftColumn>
                              <RightColumn>
                                <Title size="sm">Beneficiary</Title>
                                {item.beneficiary}
                              </RightColumn>
                            </Row>
                          )
                        })}
                      </div>
                    )
                  })}
                  {will.erc1155s.length > 0 ? <Title size="md">ERC1155 Tokens</Title> : null}
                  {will.erc1155s?.map((erc1155, i) => {
                    return (
                      <div style={{ width: '100%' }}>
                        <Row>
                          <LeftColumn>
                            <Title size="sm">Token Address</Title>
                            {erc1155.contractAddress}
                          </LeftColumn>
                          <RightColumn>
                            <Title size="sm">Token Id</Title>
                            {erc1155.tokenId.toString()}
                          </RightColumn>
                        </Row>
                        {erc1155.beneficiaries.map((item) => {
                          return (
                            <Row>
                              <LeftColumn>
                                <Title size="sm">Beneficiary</Title>
                                {item.address}
                              </LeftColumn>
                              <RightColumn>
                                <Title size="sm">Percentage</Title>
                                {item.percentage.toString()}
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
              <Button size="md" color="secondary" onClick={() => handleRequest()}>
                Request Execution
              </Button>
            </div>
          )}
          {execTime && (
            <div style={{ padding: '20px' }}>
              <div>Will executable after {new Date(execTime * 1000).toLocaleString()}</div>
              {console.log('exec', execTime)}
            </div>
          )}
          {isExecutable && (
            <div style={{ padding: '20px' }}>
              <Button size="md" color="secondary" onClick={() => handleExecute()}>
                Execute Will
              </Button>
            </div>
          )}
        </>
      ) : hasSearched ? (
        <Title size="md">Will not found</Title>
      ) : null}
    </Container>
  )
}

export default Execute
