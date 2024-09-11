/* eslint-disable no-param-reassign */
import React, { FormEvent, useState } from 'react'

import { useForm, FormProvider } from 'react-hook-form'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { QueryClient, QueryClientProvider } from 'react-query'

import { Form, Forms } from './types'

import Navbar from './components/Navbar'

import MyWill from './components/MyWill'
import Execute from './components/Execute'
import MyWills from './components/MyWills'
import { Landing } from './components/Landing'
import { sepoliaChainSelector } from './constants'

function SafeApp(): React.ReactElement {
  const { sdk, safe } = useSafeAppsSDK()
  const methods = useForm<Forms>({
    defaultValues: {
      wills: [
        {
          [Form.Cooldown]: '',
          [Form.IsActive]: false,
          [Form.RequestTime]: '0',

          [Form.Native]: [
            {
              beneficiaries: [{ address: '', percentage: 0 }],
            },
          ],

          [Form.Tokens]: [],
          [Form.NFTS]: [],
          [Form.Erc1155s]: [],
          [Form.ChainSelector]: sepoliaChainSelector,
          [Form.Safe]: safe.safeAddress,
          [Form.BaseAddress]: safe.safeAddress,
          [Form.XChainAddress]: safe.safeAddress,
          [Form.Executed]: false,
        },
      ],
    },
  })
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/myWill" element={<MyWills />} />

            <Route path="/execute" element={<Execute />} />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </QueryClientProvider>
  )
}

export default SafeApp
