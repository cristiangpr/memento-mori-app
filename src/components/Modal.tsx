/* eslint-disable react/no-array-index-key */
/* eslint-disable react/function-component-definition */
import React from 'react'
import { Button, Dot, GenericModal, Icon, Loader, Text } from '@gnosis.pm/safe-react-components'
import { StylesProvider, createStyles, makeStyles } from '@material-ui/core/styles'
import { DialogTitle, List } from '@material-ui/core'
import { useFormContext } from 'react-hook-form'
import { Forms, TransactionStatus, TransactionType } from '../types'
import {
  LeftColumn,
  RightColumn,
  ModalRow,
  StyledModal,
  StyledTitle,
  WidthWrapper,
  LoaderWrapper,
  IconWrapper,
} from './FormElements'

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
    centeredContent: {
      textAlign: 'center',
      margin: '10px',
    },
  }),
)

const ModalTitle = ({ transactionType, transactionStatus }) => {
  const titles = {
    [TransactionType.Create]: {
      [TransactionStatus.Success]: 'Will Saved',
      [TransactionStatus.Executing]: 'Saving Will',
      [TransactionStatus.Failure]: 'Transaction Failed',
      [TransactionStatus.Confirm]: 'Please Confirm',
    },
    [TransactionType.Execute]: {
      [TransactionStatus.Success]: 'Will Executed',
      [TransactionStatus.Executing]: 'Executing Will',
      [TransactionStatus.Failure]: 'Transaction Failed',
    },
    [TransactionType.Request]: {
      [TransactionStatus.Success]: 'Execution Requested',
      [TransactionStatus.Executing]: 'Requesting Execution',
      [TransactionStatus.Failure]: 'Transaction Failed',
    },
    [TransactionType.Cancel]: {
      [TransactionStatus.Success]: 'Execution Cancelled',
      [TransactionStatus.Executing]: 'Cancelling Execution',
      [TransactionStatus.Failure]: 'Transaction Failed',
    },
    [TransactionType.Delete]: {
      [TransactionStatus.Success]: 'Will Deleted',
      [TransactionStatus.Executing]: 'Deleting Will',
      [TransactionStatus.Failure]: 'Transaction Failed',
    },
  }

  return <StyledTitle size="lg">{titles[transactionType]?.[transactionStatus] || ''}</StyledTitle>
}

const ModalContent = ({ transactionStatus, classes, execTime, displayData, hasWill, handleSave }) => {
  switch (transactionStatus) {
    case TransactionStatus.Executing:
      return (
        <LoaderWrapper>
          <Loader size="lg" />
        </LoaderWrapper>
      )
    case TransactionStatus.Success:
      return (
        <IconWrapper>
          <Dot color="secondary" className={classes.dot}>
            <Icon color="white" type="check" size="md" className={classes.icon} />
          </Dot>
          {execTime && (
            <div className={classes.centeredContent}>
              Will executable after {new Date(execTime * 1000).toLocaleString()}
            </div>
          )}
        </IconWrapper>
      )
    case TransactionStatus.Failure:
      return (
        <IconWrapper>
          <Dot color="error" className={classes.dot}>
            <Icon color="white" type="error" size="md" className={classes.icon} />
          </Dot>
        </IconWrapper>
      )
    case TransactionStatus.Confirm:
      return (
        <WillConfirmContent displayData={displayData} classes={classes} hasWill={hasWill} handleSave={handleSave} />
      )
    default:
      return null
  }
}

const WillConfirmContent = ({ displayData, classes, hasWill, handleSave }) => (
  <>
    {displayData.map((will, index) => (
      <List key={index} className={classes.list}>
        <StyledTitle size="md">{`Will ${index + 1}`}</StyledTitle>
        <WillDetails will={will} />
        <div className={classes.button}>
          <Button size="md" onClick={handleSave}>
            {hasWill ? 'Update Will' : 'Create Will'}
          </Button>
        </div>
      </List>
    ))}
  </>
)

const WillDetails = ({ will }) => (
  <>
    <AssetSection title="Native Token" assets={will.native} />
    {will.tokens.length > 0 && <AssetSection title="ERC20 Tokens" assets={will.tokens} />}
    {will.nfts.length > 0 && <AssetSection title="ERC721 NFTs" assets={will.nfts} />}
    {will.erc1155s.length > 0 && <AssetSection title="ERC1155 Tokens" assets={will.erc1155s} />}
    <StyledTitle size="xs">Cooldown Period</StyledTitle>
    <div>{will.cooldown?.toString()}</div>
  </>
)

const AssetSection = ({ title, assets }) => (
  <>
    <StyledTitle size="sm">{title}</StyledTitle>
    {assets.map((asset, index) => (
      <AssetDetails key={index} asset={asset} />
    ))}
  </>
)

const AssetDetails = ({ asset }) => (
  <WidthWrapper>
    {asset.name && (
      <ModalRow>
        <StyledTitle size="xs">{asset.name}</StyledTitle>
      </ModalRow>
    )}
    {asset.contractAddress && (
      <>
        <ModalRow>
          <StyledTitle size="xs">Token Address</StyledTitle>
        </ModalRow>
        <ModalRow>
          <div>{asset.contractAddress}</div>
        </ModalRow>
      </>
    )}
    {asset.beneficiaries.map((item, index) => (
      <BeneficiaryDetails key={index} item={item} assetType={asset.tokenId ? 'nft' : 'token'} />
    ))}
  </WidthWrapper>
)

const BeneficiaryDetails = ({ item, assetType }) => (
  <ModalRow>
    <LeftColumn>
      <StyledTitle size="xs">{assetType === 'nft' ? 'Token Id' : 'Beneficiary'}</StyledTitle>
      <div>{assetType === 'nft' ? item.tokenId?.toString() : item.address}</div>
    </LeftColumn>
    <RightColumn>
      <StyledTitle size="xs">{assetType === 'nft' ? 'Beneficiary' : 'Percentage'}</StyledTitle>
      <div>{assetType === 'nft' ? item.address : item.percentage?.toString()}</div>
    </RightColumn>
  </ModalRow>
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
    <StyledModal open={isOpen} onClose={handleClose}>
      <div className={classes.paper}>
        <DialogTitle>
          <ModalTitle transactionType={transactionType} transactionStatus={transactionStatus} />
        </DialogTitle>
        <ModalContent
          transactionStatus={transactionStatus}
          classes={classes}
          execTime={execTime}
          displayData={displayData}
          hasWill={hasWill}
          handleSave={handleSave}
        />
      </div>
    </StyledModal>
  )
}
