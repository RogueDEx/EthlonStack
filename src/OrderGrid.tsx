import React, { FC } from "react"

import { Label, WidthContainer } from './AppStyles'
import { Table } from './OrderGridStyles'

export interface OrdersType {
  price: number
  amount: number
  expires: string
}

interface OrderGridProps {
  colony: string
  label: string
  orders: OrdersType[]
}

export const OrderGrid: FC<OrderGridProps> = ({ colony, label, orders }) => (
  <WidthContainer>
    <Label>{label}</Label>
    <Table>
      <thead>
        <tr>
          <th>{`${colony} Amount`}</th>
          <th>Price</th>
          <th>Expires</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(({ price, amount, expires }, index) =>
          <tr key={index}>
            <td>{amount}</td>
            <td>{`$${price.toFixed(2)}`}</td>
            <td>{expires}</td>
          </tr>
        )}
      </tbody>
    </Table>
  </WidthContainer>
)
