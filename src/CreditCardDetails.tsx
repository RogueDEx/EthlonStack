import * as React from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { Container, Field, HalfField, HalfFieldContainer } from './CreditCardDetailsStyles'
import { Label } from './AppStyles'

export const CreditCardDetails: React.FC = () => {
  // Using mock data
  const bidQuantity = 100 * Math.random() + 20
  const mockCreditCard = '1234-1234-1234-1234'
  const month = '12'
  const year = '25'
  const cvv = '123'
  const name = 'Joe Crypto'
  return (
    <Container>
      <Label>Card details</Label>
      <Field>Card number  |  {mockCreditCard}</Field>
      <HalfFieldContainer>
        <HalfField>MM/YY  |  {`${month}/${year}`}</HalfField>
        <HalfField>CVV  |  {cvv}</HalfField>
      </HalfFieldContainer>
      <Label>Name on card</Label>
      <Field>{name}</Field>
      <Label>Bid quantity</Label>
      <Field>{`${bidQuantity.toFixed(2)}`}</Field>
    </Container>
  )
}
