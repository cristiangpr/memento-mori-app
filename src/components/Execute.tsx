import React, { useEffect, useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Title, Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import { executeWill, getExecTime, getWill, getIsExecutor, requestExecution } from '../utils'
import { DisplayData } from '../types'
import { Container, LeftColumn, RightColumn, Row, Will, WillForm } from './FormElements'

function Execute(): React.ReactElement {
  const [data, setData] = useState<DisplayData>()
  const [ownerAddress, setOwnerAddress] = useState<string>()
  const [isExecutor, setIsExecutor] = useState<boolean>(false)
  const [isExecutable, setIsExecutable] = useState<boolean>(false)
  const [execTime, setExecTime] = useState<number>()

  const { safe, sdk } = useSafeAppsSDK()

  const loadData = async () => {
    const displayData = await getWill(ownerAddress, sdk)
    setData(displayData)
  }

  useEffect(() => {
    if (data) {
      setIsExecutor(getIsExecutor(data, safe))
    }
    if (data && data.isActive) {
      setExecTime(getExecTime(data))
      if (getExecTime(data) <= Date.now()) {
        setIsExecutable(true)
      }
    }
  }, [data, safe])

  return (
    <Container>
      <Title size="lg">Execute</Title>
      <Title size="sm">Enter owner address to find will and request execution</Title>
      <div style={{ width: '50%', padding: '1rem' }}>
        <TextFieldInput
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          name="ownerAddress"
          label="owner address"
        />
      </div>
      <div>
        <Button size="md" onClick={() => loadData()}>
          Find Will
        </Button>
      </div>
      {data.executors.length > 0 ? (
        <>
          <Will>
            {console.log(data)}
            <Title size="md">Cooldown Period</Title>
            <div>{data.cooldown.toString()}</div>
            <Title size="md">Native Token</Title>
            {data &&
              data.nativeToken.beneficiaries.map((element) => {
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
            {data && data.tokens.length > 0 ? <Title size="md">ERC20 Tokens</Title> : null}

            {data &&
              data.tokens?.map((token, i) => {
                // eslint-disable-next-line no-lone-blocks
                {
                  console.log('data', data)
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
            {data && data.nfts.length > 0 ? <Title size="md">ERC721 NFTs</Title> : null}
            {data &&
              data.nfts?.map((nft, i) => {
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
            {data && data.erc1155s.length > 0 ? <Title size="md">ERC1155 Tokens</Title> : null}
            {data &&
              data.erc1155s?.map((erc1155, i) => {
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
          {isExecutor && (
            <div style={{ padding: '20px' }}>
              <Button size="md" onClick={() => requestExecution(ownerAddress, sdk)}>
                Request Execution
              </Button>
            </div>
          )}
          {execTime && (
            <div style={{ padding: '20px' }}>
              <div>Will executable after {new Date(execTime).toDateString()}</div>
            </div>
          )}
          {isExecutable && (
            <div style={{ padding: '20px' }}>
              <Button size="md" onClick={() => executeWill(ownerAddress, sdk)}>
                Execute Will
              </Button>
            </div>
          )}
        </>
      ) : (
        <Title size="md">Will not found</Title>
      )}
    </Container>
  )
}

export default Execute
