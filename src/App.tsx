import React, { FC, useEffect, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { CreditCardDetails } from './CreditCardDetails'
import { VibeSelect } from './VibeSelect'
import {
  Button,
  ColonyTitle,
  AppHeader,
  AppLogo,
  AppImage,
  AppLogoText,
  AppTitle,
  AppMain,
  AppMainTitle
} from './AppStyles'
import { Orders } from './Orders'
import { PlaceOrder } from './PlaceOrder'

const App: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null)
  const [colony, setColony] = useState<string>('Elysium')
  const [tokenBalance, setTokenBalance] = useState<string>('0')

  useEffect(() => {
    const storageKey = 'privateKey'
    const web3 = new Web3('ws://deploy.radar.tech/ethdenver2020')
    const privateKey = localStorage.getItem(storageKey)
    const account = privateKey == null ?
      web3.eth.accounts.create() :
      web3.eth.accounts.privateKeyToAccount(privateKey)

    setAccount(account)

    if (privateKey == null) {
      localStorage.setItem(storageKey, account.privateKey);
    }

    // replace token address
    let tokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'
    let walletAddress = account.address

    // The minimum ABI to get ERC20 Token balance
    // TODO types for these fields
    const minABI: any = [
      // balanceOf
      {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
      },
      // decimals
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
      }
    ];

    // Get ERC20 Token contract instance
    const contract: any = new web3.eth.Contract(minABI, tokenAddress)
    console.log(contract, setTokenBalance)
    // Call balanceOf function
    // contract.balanceOf(walletAddress, (error: any, balance: any) => {
    //   // Get decimals
    //   contract.decimals((error: any, decimals: any) => {
    //     // calculate a balance
    //     balance = balance.div(10 ** decimals);
    //     setTokenBalance(balance.toString())
    //   })
    // })
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
      <AppHeader>
        <AppLogo>
          <AppLogoText>Ethlon Musk</AppLogoText>
          <AppImage src="/ethlon.png" height="50" />
        </AppLogo>
        <AppTitle>Mars Real Estate For Sale</AppTitle>
        <ColonyTitle>{`Selected: ${colony} Colony`}</ColonyTitle>
      </AppHeader>
      <AppMain><AppMainTitle>Claim your Martian parcel with Vibe</AppMainTitle>
        <VibeSelect setColony={setColony} />
      </AppMain>
      <CreditCardDetails />
      <Button onClick={submitData}>Bid</Button>
      {tokenBalance !== '0' &&
        <>
          <Orders colony={colony} />
          <PlaceOrder colony={colony} />
        </>
      }
    </>
  )
}

export default App;
