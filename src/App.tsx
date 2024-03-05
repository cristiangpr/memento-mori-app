/* eslint-disable no-param-reassign */
import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { Title, TextField, Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import { Controller, useFieldArray, useForm, FormProvider, useFormContext } from 'react-hook-form'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { useSafeBalances } from './hooks/useSafeBalances'
import BalancesTable from './components/BalancesTable'
import { Form, FormTypes, Forms } from './types'

// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './components/BeneficiaryFields'
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
  return (
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
  )
}

export default SafeApp
