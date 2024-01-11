/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Dot, GenericModal, Icon, Loader } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { TransactionStatus, TransactionType } from '../types'

export const Modal: React.FC<{
  transactionType: TransactionType
  transactionStatus: TransactionStatus

  handleClose: () => void
  hasWill?: boolean
  execTime?: number
}> = ({ transactionType, transactionStatus, hasWill, execTime, handleClose }) => {
  return (
    <>
      {transactionType === TransactionType.Create && (
        <GenericModal
          title={
            transactionStatus === TransactionStatus.Success
              ? 'Will Saved'
              : transactionStatus === TransactionStatus.Executing
              ? 'Saving Will'
              : transactionStatus === TransactionStatus.Failure
              ? 'Transaction Failed'
              : null
          }
          body={
            transactionStatus === TransactionStatus.Executing ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="error">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : null
          }
          onClose={() => handleClose()}
        />
      )}
      {transactionType === TransactionType.Execute && (
        <GenericModal
          title={
            transactionStatus === TransactionStatus.Success
              ? 'Will Executed'
              : transactionStatus === TransactionStatus.Executing
              ? 'Executing Will'
              : transactionStatus === TransactionStatus.Failure
              ? 'Transaction Failed'
              : null
          }
          body={
            transactionStatus === TransactionStatus.Executing ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="error">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : null
          }
          onClose={() => handleClose()}
        />
      )}
      {transactionType === TransactionType.Request && (
        <GenericModal
          title={
            transactionStatus === TransactionStatus.Success
              ? 'Execution Requested'
              : transactionStatus === TransactionStatus.Executing
              ? 'Requesting Execution'
              : transactionStatus === TransactionStatus.Failure
              ? 'Transaction Failed'
              : null
          }
          body={
            transactionStatus === TransactionStatus.Executing ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <>
                <div style={{ paddingLeft: '12.875rem' }}>
                  <Dot color="primary">
                    <Icon color="white" type="check" size="md" />
                  </Dot>
                </div>
                <div>{execTime && `Will executable after ${new Date(execTime * 1000).toLocaleString()}`}</div>
              </>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="error">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : null
          }
          onClose={() => handleClose()}
        />
      )}
      {transactionType === TransactionType.Cancel && (
        <GenericModal
          title={
            transactionStatus === TransactionStatus.Success
              ? 'Execution Cancelled'
              : transactionStatus === TransactionStatus.Executing
              ? 'Cancelling Execution'
              : transactionStatus === TransactionStatus.Failure
              ? 'Transaction Failed'
              : null
          }
          body={
            transactionStatus === TransactionStatus.Executing ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="error">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : null
          }
          onClose={() => handleClose()}
        />
      )}
      {transactionType === TransactionType.Delete && (
        <GenericModal
          title={
            transactionStatus === TransactionStatus.Success
              ? 'Will Deleted'
              : transactionStatus === TransactionStatus.Executing
              ? 'Deleting Will'
              : transactionStatus === TransactionStatus.Failure
              ? 'Transaction Failed'
              : null
          }
          body={
            transactionStatus === TransactionStatus.Executing ? (
              <div style={{ paddingLeft: '11.875rem' }}>
                <Loader size="lg" />
              </div>
            ) : transactionStatus === TransactionStatus.Success ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="primary">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : transactionStatus === TransactionStatus.Failure ? (
              <div style={{ paddingLeft: '12.875rem' }}>
                <Dot color="error">
                  <Icon color="white" type="check" size="md" />
                </Dot>
              </div>
            ) : null
          }
          onClose={() => handleClose()}
        />
      )}
    </>
  )
}

export default Modal
