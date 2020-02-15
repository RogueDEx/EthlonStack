import React, { FC } from "react"

import { OrderGrid } from './OrderGrid'
import { Label } from './AppStyles'
import { OrdersContainer } from './OrdersStyles'

interface OrdersProps {
  colony: string
}

export const Orders: FC<OrdersProps> = ({ colony }) => (
  <OrdersContainer>
    <Label>Order books</Label>
    <OrderGrid label="Buyers" colony={colony} />
    <OrderGrid label="Sellers" colony={colony} />
  </OrdersContainer>
)
