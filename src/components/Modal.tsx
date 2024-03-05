/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Button, Dot, GenericModal, Icon, Loader, Text } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { StylesProvider, createStyles, makeStyles } from '@material-ui/core/styles'
import { DialogTitle, List } from '@material-ui/core'
import { useFormContext } from 'react-hook-form'
import { Forms, TransactionStatus, TransactionType } from '../types'
import { LeftColumn, RightColumn, ModalRow, StyledModal, StyledTitle } from './FormElements'

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      borderRadius: '8px',
      width: 600,
      height: 'fit-content',
    },

    list: {
      padding: '0 5px 0 24px',
    },
    button: {
      textAlign: 'center',
      margin: 10,
    },
    dot: {
      height: 77,
      width: 77,
    },
    icon: {
      transform: 'scale(2)',
    },
  }),
)

export const Modal: React.FC<{
  transactionType: TransactionType
  transactionStatus: TransactionStatus
  isOpen: boolean
  handleClose: () => void
  handleSave?: () => void
  hasWill?: boolean
  execTime?: number
}> = ({ transactionType, transactionStatus, hasWill, execTime, handleClose, isOpen, handleSave }) => {
  const classes = useStyles()
  const { getValues } = useFormContext()
  const values = getValues()
  const displayData = values.wills
  return (
    <>
      {transactionType === TransactionType.Create && (
        <StyledModal open={isOpen} onClose={() => handleClose()}>
          <div className={classes.paper}>
            <DialogTitle>
              <StyledTitle size="lg">
                {transactionStatus === TransactionStatus.Success
                  ? 'Will Saved'
                  : transactionStatus === TransactionStatus.Executing
                  ? 'Saving Will'
                  : transactionStatus === TransactionStatus.Failure
                  ? 'Transaction Failed'
                  : transactionStatus === TransactionStatus.Confirm
                  ? 'Please Confirm'
                  : null}
              </StyledTitle>
            </DialogTitle>
            <div>
              {transactionStatus === TransactionStatus.Confirm ? (
                displayData.map((will, index) => {
                  return (
                    <List className={classes.list}>
                      <StyledTitle size="md">{`Will ${index + 1}`}</StyledTitle>

                      {console.log('will', will)}

                      <StyledTitle size="sm">Native Token</StyledTitle>
                      {will.native[0].beneficiaries.map((element) => {
                        return (
                          <ModalRow>
                            <LeftColumn>
                              <StyledTitle size="xs">Beneficiary</StyledTitle>
                              <div>{element.address}</div>
                            </LeftColumn>
                            <RightColumn>
                              <StyledTitle size="xs">Percentage</StyledTitle>
                              <div>{element.percentage?.toString()}</div>
                            </RightColumn>
                          </ModalRow>
                        )
                      })}
                      {will.tokens.length > 0 ? <StyledTitle size="sm">ERC20 Tokens</StyledTitle> : null}

                      {will.tokens?.map((token, i) => {
                        // eslint-disable-next-line no-lone-blocks
                        {
                          console.log('displayData', displayData)
                        }
                        return (
                          <div style={{ width: '100%' }}>
                            {token.name && (
                              <ModalRow>
                                <StyledTitle size="xs">{token.name} </StyledTitle>
                              </ModalRow>
                            )}
                            <ModalRow>
                              <StyledTitle size="xs">TokenAddress </StyledTitle>
                            </ModalRow>
                            <ModalRow>
                              <div>{token.contractAddress}</div>
                            </ModalRow>
                            {token.beneficiaries.map((item) => {
                              return (
                                <ModalRow>
                                  <LeftColumn>
                                    <StyledTitle size="xs">Beneficiary</StyledTitle>
                                    {item.address}
                                  </LeftColumn>
                                  <LeftColumn>
                                    <StyledTitle size="xs">Percentage</StyledTitle>
                                    {item.percentage?.toString()}
                                  </LeftColumn>
                                </ModalRow>
                              )
                            })}
                          </div>
                        )
                      })}
                      {will.nfts.length > 0 ? <StyledTitle size="sm">ERC721 NFTs</StyledTitle> : null}
                      {will.nfts?.map((nft, i) => {
                        return (
                          <div style={{ width: '100%' }}>
                            {nft.name && (
                              <ModalRow>
                                <StyledTitle size="xs">{nft.name} </StyledTitle>
                              </ModalRow>
                            )}
                            <ModalRow>
                              <StyledTitle size="xs">TokenAddress </StyledTitle>
                            </ModalRow>
                            <ModalRow>
                              <div>{nft.contractAddress}</div>
                            </ModalRow>
                            {nft.beneficiaries.map((item) => {
                              return (
                                <ModalRow>
                                  <LeftColumn>
                                    <StyledTitle size="xs">Token Id</StyledTitle>
                                    {item.tokenId?.toString()}
                                  </LeftColumn>
                                  <RightColumn>
                                    <StyledTitle size="xs">Beneficiary</StyledTitle>
                                    {item.address}
                                  </RightColumn>
                                </ModalRow>
                              )
                            })}
                          </div>
                        )
                      })}
                      {will.erc1155s.length > 0 ? <StyledTitle size="sm">ERC1155 Tokens</StyledTitle> : null}
                      {will.erc1155s?.map((erc1155, i) => {
                        return (
                          <div style={{ width: '100%' }}>
                            {erc1155.name && (
                              <ModalRow>
                                <StyledTitle size="xs">{erc1155.name} </StyledTitle>
                              </ModalRow>
                            )}
                            <ModalRow>
                              <LeftColumn>
                                <StyledTitle size="xs">Token Address</StyledTitle>
                                {erc1155.contractAddress}
                              </LeftColumn>
                              <RightColumn>
                                <StyledTitle size="xs">Token Id</StyledTitle>
                                {erc1155.tokenId?.toString()}
                              </RightColumn>
                            </ModalRow>
                            {erc1155.beneficiaries.map((item) => {
                              return (
                                <ModalRow>
                                  <LeftColumn>
                                    <StyledTitle size="xs">Beneficiary</StyledTitle>
                                    {item.address}
                                  </LeftColumn>
                                  <RightColumn>
                                    <StyledTitle size="xs">Percentage</StyledTitle>
                                    {item.percentage?.toString()}
                                  </RightColumn>
                                </ModalRow>
                              )
                            })}
                          </div>
                        )
                      })}
                      <StyledTitle size="xs">Cooldown Period</StyledTitle>
                      <div>{will.cooldown?.toString()}</div>
                      <div className={classes.button}>
                        <Button size="md" onClick={handleSave}>
                          {hasWill ? 'Update Will' : 'Create Will'}
                        </Button>
                      </div>
                    </List>
                  )
                })
              ) : transactionStatus === TransactionStatus.Executing ? (
                <div style={{ textAlign: 'center', margin: '10px' }}>
                  <Loader size="lg" />
                </div>
              ) : transactionStatus === TransactionStatus.Success ? (
                <div style={{ margin: '0 0 10px 261.5px' }}>
                  <Dot color="secondary" className={classes.dot}>
                    <Icon color="white" type="check" size="md" className={classes.icon} />
                  </Dot>
                </div>
              ) : transactionStatus === TransactionStatus.Failure ? (
                <div style={{ margin: '0 0 10px 261.5px' }}>
                  <Dot color="error" className={classes.dot}>
                    <Icon color="white" type="error" size="md" className={classes.icon} />
                  </Dot>
                </div>
              ) : null}
            </div>
          </div>
        </StyledModal>
      )}
      {transactionType === TransactionType.Execute && (
        <StyledModal open={isOpen} onClose={handleClose}>
          <div className={classes.paper}>
            <DialogTitle>
              <StyledTitle size="lg">
                {transactionStatus === TransactionStatus.Success
                  ? 'Will Executed'
                  : transactionStatus === TransactionStatus.Executing
                  ? 'Executing Will'
                  : transactionStatus === TransactionStatus.Failure
                  ? 'Transaction Failed'
                  : null}
              </StyledTitle>
            </DialogTitle>
            {transactionStatus === TransactionStatus.Executing ? (
              <div style={{ textAlign: 'center', margin: '10px' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="secondary" className={classes.dot}>
                  <Icon color="white" type="check" size="md" className={classes.icon} />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="error" className={classes.dot}>
                  <Icon color="white" type="error" size="md" className={classes.icon} />
                </Dot>
              </div>
            ) : null}
          </div>
        </StyledModal>
      )}
      {transactionType === TransactionType.Request && (
        <StyledModal open={isOpen} onClose={handleClose}>
          <div className={classes.paper}>
            <DialogTitle>
              <StyledTitle size="lg">
                {transactionStatus === TransactionStatus.Success
                  ? 'Execution Requested'
                  : transactionStatus === TransactionStatus.Executing
                  ? 'Requesting Execution'
                  : transactionStatus === TransactionStatus.Failure
                  ? 'Transaction Failed'
                  : null}
              </StyledTitle>
            </DialogTitle>
            {transactionStatus === TransactionStatus.Executing ? (
              <div style={{ textAlign: 'center', margin: '10px' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <>
                <div style={{ margin: '0 0 10px 261.5px' }}>
                  <Dot color="secondary" className={classes.dot}>
                    <Icon color="white" type="check" size="md" className={classes.icon} />
                  </Dot>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {execTime && `Will executable after ${new Date(execTime * 1000).toLocaleString()}`}
                </div>
              </>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="error" className={classes.dot}>
                  <Icon color="error" type="check" size="md" className={classes.icon} />
                </Dot>
              </div>
            ) : null}
          </div>
        </StyledModal>
      )}
      {transactionType === TransactionType.Cancel && (
        <StyledModal open={isOpen} onClose={handleClose}>
          <div className={classes.paper}>
            <DialogTitle>
              <StyledTitle size="lg">
                {transactionStatus === TransactionStatus.Success
                  ? 'Execution Cancelled'
                  : transactionStatus === TransactionStatus.Executing
                  ? 'Cancelling Execution'
                  : transactionStatus === TransactionStatus.Failure
                  ? 'Transaction Failed'
                  : null}
              </StyledTitle>
            </DialogTitle>
            {transactionStatus === TransactionStatus.Executing ? (
              <div style={{ textAlign: 'center', margin: '10px' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="secondary" className={classes.dot}>
                  <Icon color="white" type="check" size="md" className={classes.icon} />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="error" className={classes.dot}>
                  <Icon color="white" type="error" className={classes.icon} size="md" />
                </Dot>
              </div>
            ) : null}
          </div>
        </StyledModal>
      )}
      {transactionType === TransactionType.Delete && (
        <StyledModal open={isOpen} onClose={handleClose}>
          <div className={classes.paper}>
            <DialogTitle>
              <StyledTitle size="lg">
                {transactionStatus === TransactionStatus.Success
                  ? 'Will Deleted'
                  : transactionStatus === TransactionStatus.Executing
                  ? 'Deleting Will'
                  : transactionStatus === TransactionStatus.Failure
                  ? 'Transaction Failed'
                  : null}
              </StyledTitle>
            </DialogTitle>
            {transactionStatus === TransactionStatus.Executing ? (
              <div style={{ textAlign: 'center', margin: '10px' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="secondary" className={classes.dot}>
                  <Icon color="white" type="check" size="md" className={classes.icon} />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ margin: '0 0 10px 261.5px' }}>
                <Dot color="error" className={classes.dot}>
                  <Icon color="white" type="error" className={classes.icon} size="md" />
                </Dot>
              </div>
            ) : null}
          </div>
        </StyledModal>
      )}
    </>
  )
}
