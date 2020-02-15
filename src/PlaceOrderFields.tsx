import React, { FC, useState } from "react"

import { PlaceOrderFieldsContainer, CustomInput } from './PlaceOrderFieldsStyles'

interface PlaceOrderFieldsProps {
  label: string
  type: string
  setAmount: (amount: number) => void
}

export const PlaceOrderFields: FC<PlaceOrderFieldsProps> = ({ label, type, setAmount }) => (
  <PlaceOrderFieldsContainer>
    <div>{label}</div>
    <div>{type}</div>
    <div>Quantity</div>
    <CustomInput type="number" onChange={(e) => setAmount(Number(e.target.value))} />
  </PlaceOrderFieldsContainer>
)
