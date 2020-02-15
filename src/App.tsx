import * as React from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { Button, Title, BankNumber, Balance } from './AppStyles'

const App: React.FC = () => {
  const [account, setAccount] = React.useState<Account | null>(null)
  const [colony, setColony] = React.useState<string | null>(null)

  React.useEffect(() => {
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
    <>
      <Title>{`Colony ${colony}`}</Title>
      <BankNumber>{mockCreditCard}</BankNumber>
      <Balance>`${balance.toFixed(2)}`</Balance>
      <Button onClick={submitData}>Purchase land</Button>
      {['Elysium', 'Hellas', 'Planum Australe', 'Meridiani Planum'].map((colony, index) => (
        <div key={index} onClick={() => setColony(colony)}>{colony}</div>
      ))}
    </>
  )
}

export default App;
