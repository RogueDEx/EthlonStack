import React, { FC, useEffect, useReducer, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'
// import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import axios from 'axios'

import erc20Json from './abi/erc20.json'
import { CreditCardDetails } from './CreditCardDetails'
import { VibeSelect } from './VibeSelect'
import { reducer, initialState } from './VibesReducer'
import {
  Button,
  AppHeader,
  AppLogo,
  AppImage,
  AppLogoText,
  AppMain,
  AppMainTitle,
  AppSubTitle,
  AppSubBar,
  AppContainer,
  AppLogoImage
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
      const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
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
        // @ts-ignore
        const contract: Contract = new web3.eth.Contract(erc20Json, tokenAddress)
        const fetchBalance = await contract.methods.balanceOf(walletAddress).call()
        return dispatch({
          type: 'update-balance',
          tokenBalance: Number(fetchBalance),
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

  const submitData = async () => {
    console.log('submitting')
    if (account != null) {
      const response = await axios({
        method: 'post',
        url: 'http://dev.ethlonmusk.com/',
        data: {
          address: account.address,
          creditCard: mockCreditCard,
          balance
        }
      })
      if (response.status === 200) {
        return alert('transacion posted. you will receive your tokens shortly')
      }
      return alert('transacion failed. Please contact support')
    } else {
      alert('there is no account')
    }
  }

  return (
    <AppContainer>
      <AppHeader>
        <AppLogo>
          <AppLogoImage src="/ethlon.png" />
          <AppLogoText>Vibe</AppLogoText>
        </AppLogo>
      </AppHeader>
      <AppMain>
        <AppImage src="/ethlon.png" />
        <AppMainTitle>Martian Real Estate for Everyone</AppMainTitle>
        <AppSubTitle>Secured on Ethereum. No gas required</AppSubTitle>
        <Button onClick={() => window.scrollBy(0, 550)}>Get vibe</Button>
        <AppSubBar>Currently for sale:</AppSubBar>
        <AppMainTitle>{colony}</AppMainTitle>
      </AppMain>
      <CreditCardDetails />
      <Button onClick={submitData}>Bid</Button>
      {tokenBalance === 0 &&
        <>
          {/* <VibeSelect setColony={setColony} vibes={vibes} /> */}
          <Orders colony={colony} />
          <PlaceOrder colony={colony} />
        </>
      }
    </AppContainer>
  )
}

export default App;
