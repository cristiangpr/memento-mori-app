import { GenericModal, Table, TextFieldInput, Title } from '@gnosis.pm/safe-react-components'
import { Dialog, Modal, Stepper } from '@material-ui/core'
import styled from 'styled-components'

export const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;

  align-items: center;
  flex-direction: column;
`
export const Will = styled.div`
  padding: 1rem;
  width: 75%;
`

export const WillForm = styled.form`
  padding: 1rem;
  width: 65%;
`
export const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0.5rem 0 0.5rem 0;
`
export const ModalRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`
export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  padding-right: 1rem;
`
export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  padding-left: 1rem;
`
export const StyledStepper = styled(Stepper)`
  && {
    .MuiStepIcon-root.MuiStepIcon-active {
      color: ${(props) => props.theme.colors.primary};
    }
    .MuiStepIcon-root.MuiStepIcon-completed {
      color: ${(props) => props.theme.colors.secondary};
    }
    .MuiStepLabel-label {
      color: ${(props) => props.theme.colors.primary};
    }
    background: rgb(31 41 55);
    color: white;
  }
`
export const StyledTitle = styled(Title)`
  color: ${(props) => props.theme.colors.primary};
  font-weight: bolder;
  margin-top: 13px;
  margin-bottom: 13px;
`
export const StyledInput = styled(TextFieldInput)`
  && {
    .MuiFormHelperText-root.MuiFormHelperText-contained {
      color: ${(props) => props.theme.colors.white};
    }
    .MuiFormHelperText-root.Mui-error {
      color: ${(props) => props.theme.colors.error};
    }
    .MuiFormLabel-root.Mui-focused {
      color: ${(props) => props.theme.colors.primary};
    }
    .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${(props) => props.theme.colors.primary} !important;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-background-clip: text;
      -webkit-text-fill-color: ${(props) => props.theme.colors.white};
      transition: background-color 5000s ease-in-out 0s;
      box-shadow: inset 0 0 20px 20px #23232329;
    }
  }
`
export const StyledTable = styled(Table)`
  && {
    background: rgb(66, 69, 74);
    .MuiTableCell-head {
      color: ${(props) => props.theme.colors.primary};
    }
    .MuiTable-root {
      border-radius: 8px;
    }
    .MuiTableCell-body {
      color: white;
    }
  }
`
export const StyledModal = styled(Dialog)`
  && {
    .MuiPaper-root {
      background-color: rgb(31 41 55) !important;
      color: white;
    }
  }
`
