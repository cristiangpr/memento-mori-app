import React, { useEffect, useState } from 'react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Title, Button } from '@gnosis.pm/safe-react-components'
import { executeWill, getWill } from '../utils'
import { DisplayData } from '../types'
import { Container, LeftColumn, RightColumn, Row, Will } from './FormElements'

function MyWill(): React.ReactElement {
  const [data, setData] = useState<DisplayData>()
  const { safe, sdk } = useSafeAppsSDK()
  useEffect(() => {
    const loadData = async () => {
      const displayData = await getWill(safe, sdk)
      setData(displayData)
    }
    loadData()
  }, [safe, sdk])
  return (
    <Container>
      <Title size="lg">My Will</Title>
      {data && (
        <>
          <Will>
            <Title size="md">User Info</Title>
            <Row>
              <LeftColumn>
                <Title size="sm">Firts Name</Title>
                <div>{data.firstName}</div>
              </LeftColumn>
              <RightColumn>
                <Title size="sm">Initial</Title>
                <div>{data.initial}</div>
              </RightColumn>
            </Row>
            <Row>
              <LeftColumn>
                <Title size="sm">Last Name</Title>
                <div>{data.lastName}</div>
              </LeftColumn>
              <RightColumn>
                <Title size="sm">Date of Birth</Title>
                <div>{data.birthDate}</div>
              </RightColumn>
            </Row>
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
          <div style={{ padding: '20px' }}>
            <Button size="md" onClick={() => executeWill(sdk, safe)}>
              Execute Will
            </Button>
          </div>
        </>
      )}
    </Container>
  )
}

export default MyWill
