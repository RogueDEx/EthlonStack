import React, { FC, useEffect, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { CreditCardDetails } from './CreditCardDetails'
import { VibeSelect } from './VibeSelect'
import { Button, Title, Label, AppContainer } from './AppStyles'
import { Orders } from './Orders'
import { PlaceOrder } from './PlaceOrder'

const App: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null)
  const [colony, setColony] = useState<string>('Elysium')

  useEffect(() => {
    const web3 = new Web3('ws://deploy.radar.tech/ethdenver2020')
    const whatAmI = web3.eth.accounts.create()
    setAccount(web3.eth.accounts.create())
  }, [])

  // Mock data
  const balance = 100 * Math.random() + 20
  const mockCreditCard = '1234-1234-1234-1234'

  const submitData = () => {
    if (account != null) {
      console.log('submit me to the backend', account.address, mockCreditCard)
    } else {
      alert('there is no account')
    }
  }
  return (
    <AppContainer>
      <Title>{`${colony} Colony`}</Title>
      <CreditCardDetails />
      <Button onClick={submitData}>Bid</Button>
      <VibeSelect setColony={setColony} />
      <Orders colony={colony} />
      <PlaceOrder colony={colony} />
    </AppContainer >
  )
}

export default App;
