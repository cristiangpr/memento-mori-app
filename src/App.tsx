/* eslint-disable no-param-reassign */
import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { Title, TextField, Button, TextFieldInput } from '@gnosis.pm/safe-react-components'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSafeBalances } from './hooks/useSafeBalances'
import BalancesTable from './components/BalancesTable'
import { Form, FormTypes } from './types'

// eslint-disable-next-line import/no-cycle
import BeneficiaryFields from './components/BeneficiaryFields'
import Navbar from './components/Navbar'
import MyWill from './components/MyWill'
import Execute from './components/Execute'
import MyWills from './components/MyWills'

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;

  align-items: center;
  flex-direction: column;
`
const Input = styled.input`
  type: text;
  height 2rem;
  width: 100%;
  border-radius: 5px;
  font-size: 15px;

`
const WillForm = styled.form`
  padding: 1rem;
  width: 50%;
`
export const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0.5rem 0 0.5rem 0;
`
export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  padding-right: 0.5rem;
`
export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
  padding-left: 0.5rem;
`
export const FloatColumn = styled.div`
  width: 45%;
  float: left;
  padding: 0.5rem;
`

function SafeApp(): React.ReactElement {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MyWills />} />

        <Route path="/execute" element={<Execute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default SafeApp
