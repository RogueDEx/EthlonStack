import React, { FC } from "react"

import { PlaceOrderFieldsContainer, CustomInput } from './PlaceOrderFieldsStyles'

interface PlaceOrderFieldsProps {
  label: string
  type: string
  setAmount: (amount: number) => void
  tokenBalance: number
}

export const PlaceOrderFields: FC<PlaceOrderFieldsProps> = ({ label, type, setAmount, tokenBalance }) => (
  <PlaceOrderFieldsContainer>
    <div>{label}</div>
    <div>{type}</div>
    <div>Quantity</div>
    {type === 'USD' ?
      <CustomInput type="number" onChange={(e) => setAmount(Number(e.target.value))} /> :
      <CustomInput type="number" max={tokenBalance} onChange={(e) => setAmount(Number(e.target.value))} />
    }
  </PlaceOrderFieldsContainer>
)
