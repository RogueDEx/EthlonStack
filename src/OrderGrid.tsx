import React, { FC } from "react"

import { Label, WidthContainer } from './AppStyles'
import { Table } from './OrderGridStyles'

interface OrderGridProps {
  colony: string
  label: string
}

export const OrderGrid: FC<OrderGridProps> = ({ colony, label }) => {
  const orders = [
    {
      price: 0.50,
      amount: 20,
      expires: '1hr'
    },
    {
      price: 0.70,
      amount: 25,
      expires: '1hr'
    },
    {
      price: 0.80,
      amount: 10,
      expires: '1hr'
    },
    {
      price: 0.90,
      amount: 5,
      expires: '1hr'
    }
  ]
  return (
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
          {orders.map(({ price, amount, expires }) =>
            <tr>
              <td>{amount}</td>
              <td>{`$${price.toFixed(2)}`}</td>
              <td>{expires}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </WidthContainer>
  )
}
