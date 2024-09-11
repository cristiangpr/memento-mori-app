import React from 'react'
import ReactDOM from 'react-dom'
import createTheme, { ThemeProvider } from 'styled-components'
import { Loader, Title } from '@gnosis.pm/safe-react-components'
import SafeProvider from '@safe-global/safe-apps-react-sdk'

import { theme } from './theme'

import GlobalStyle from './GlobalStyle'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SafeProvider
        loader={
          <>
            <Title size="md">Waiting for Safe...</Title>
            <Loader size="md" />
          </>
        }
      >
        <App />
      </SafeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
