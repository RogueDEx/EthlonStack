import React, { FC, useState } from "react"

import { PlaceOrderFieldsContainer } from './PlaceOrderFieldsStyles'

interface PlaceOrderFieldsProps {
  label: string
  type: string
  setAmount: (amount: string) => void
}

export const PlaceOrderFields: FC<PlaceOrderFieldsProps> = ({ label, type, setAmount }) => (
  <PlaceOrderFieldsContainer>
    <div>{label}</div>
    <div>{type}</div>
    <div>Quantity</div>
    <input onChange={(e) => e.target.value} />
  </PlaceOrderFieldsContainer>
)
