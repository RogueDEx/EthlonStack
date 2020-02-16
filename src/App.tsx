import React, { FC, useEffect, useReducer, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import elysiumJson from './abi/elysium.json'
import hellasJson from './abi/hellas.json'
import meridianiPlanumJson from './abi/meridiani_planum.json'
import planumAustraleJson from './abi/planum_australe.json'
import { CreditCardDetails } from './CreditCardDetails'
import { VibeSelect } from './VibeSelect'
import { reducer, initialState } from './VibesReducer'
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

export interface Vibe {
  name: string
  tokenAddress: string
  tokenBalance: number
}

const App: React.FC = () => {
  const [vibes, dispatch] = useReducer(reducer, initialState)
  const [account, setAccount] = useState<Account | null>(null)
  const [colony, setColony] = useState<string>('Elysium')

  useEffect(() => {
    async function setupAndGetBalances() {
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

      const walletAddress: string = account.address

      return vibes.map(async ({ tokenAddress, name }) => {
        let minABI: AbiItem
        switch (name) {
          case 'Elysium': {
            minABI = elysiumJson
          }
          case 'Hellas': {
            minABI = hellasJson
            break;
          }
          case 'Planum Australe': {
            minABI = planumAustraleJson
            break;
          }
          case 'Meridiani Planum': {
            minABI = meridianiPlanumJson
            break;
          }
          default: {
            throw new Error('unexpected name')
            break;
          }
        }

        // Get ERC20 Token contract instance
        const contract: Contract = new web3.eth.Contract(minABI, tokenAddress)
        const balance = await contract.methods.balanceOf(walletAddress).call()
        console.log('balance', balance)
        return dispatch({
          type: 'update-balance',
          tokenBalance: balance,
          name
        })
      })
    }
    setupAndGetBalances()
  }, [])

  // Mock data
  const balance = 100 * Math.random() + 20
  const mockCreditCard = '1234-1234-1234-1234'
  const { tokenBalance } = vibes.find(({ name }) => name === colony) as Vibe

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
        <VibeSelect setColony={setColony} vibes={vibes} />
      </AppMain>
      <CreditCardDetails />
      <Button onClick={submitData}>Bid</Button>
      {tokenBalance !== 0 &&
        <>
          <Orders colony={colony} />
          <PlaceOrder colony={colony} />
        </>
      }
    </>
  )
}

export default App;
