import { Button, Table } from '@gnosis.pm/safe-react-components'
import { TokenBalance, TokenInfo, TokenType } from '@gnosis.pm/safe-apps-sdk'
import BigNumber from 'bignumber.js'
import { Token } from '../types'
import { StyledTable } from './FormElements'

const ethToken: TokenInfo = {
  address: '0x0000000000000',
  type: TokenType.NATIVE_TOKEN,
  logoUri: './eth.svg',
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
}

const formatTokenValue = (value: number | string, decimals: number): string => {
  return new BigNumber(value).times(`1e-${decimals}`).toFixed()
}

const formatFiatValue = (value: string, currency: string): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(value))
}

function Balances({ balances, addToken }: { balances: TokenBalance[]; addToken: (token: Token) => void }): JSX.Element {
  return (
    <div>
      <StyledTable
        headers={[
          { id: 'col1', label: 'Asset' },
          { id: 'col2', label: 'Address' },
          { id: 'col3', label: 'Amount' },
          { id: 'col4', label: '' },
        ]}
        rows={balances.map((item: TokenBalance, index: number) => {
          const token = item.tokenInfo.type === 'NATIVE_TOKEN' ? ethToken : item.tokenInfo

          return {
            id: `row${index}`,
            cells: [
              {
                content: <div style={{ display: 'flex', alignItems: 'center' }}>{token.name}</div>,
              },
              { content: token.address },

              { content: formatTokenValue(item.balance, token.decimals) },
              {
                content:
                  token.type === 'NATIVE_TOKEN' ? null : (
                    <Button
                      size="md"
                      onClick={() =>
                        addToken({
                          contractAddress: token.address,
                          beneficiaries: [{ address: '', percentage: null }],
                          name: token.name,
                        })
                      }
                    >
                      Add Token
                    </Button>
                  ),
              },
            ],
          }
        })}
      />
    </div>
  )
}

export default Balances
