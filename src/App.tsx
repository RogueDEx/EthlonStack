import React, { FC, useEffect, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import axios from 'axios'

import erc20Json from './abi/erc20.json'
import { CreditCardDetails } from './CreditCardDetails'
import { SuccessInterval } from './SuccessInterval'
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
  AppLogoImage,
  ElysiumMain
} from './AppStyles'
import { Orders } from './Orders'
import { PlaceOrder } from './PlaceOrder'

export interface Vibe {
  name: string
  tokenAddress: string
  tokenBalance: number
}

const App: FC = () => {
  const colony = 'Elysium'
  const tokenAddress = '0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6'
  const [account, setAccount] = useState<Account | null>(null)
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    async function setupAndGetBalances() {
      const storageKey = 'privateKey'
      const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
      // const privateKey = localStorage.getItem(storageKey)
      const privateKey = "0x1ed4a78eada0b037bb157f6750ac7fd6b6ad99fe021e276c2761f8708eb63447"
      const account = privateKey == null ?
        web3.eth.accounts.create() :
        web3.eth.accounts.privateKeyToAccount(privateKey)

      setAccount(account)

      if (privateKey == null) {
        localStorage.setItem(storageKey, account.privateKey);
      }

      const walletAddress: string = account.address
      // @ts-ignore
      const contract: Contract = new web3.eth.Contract(erc20Json, tokenAddress)
      const fetchBalance = await contract.methods.balanceOf(walletAddress).call()
      return setTokenBalance(Number(fetchBalance))
    }
    setupAndGetBalances()
  }, [])

  // Mock data
  const balance = 100 * Math.random() + 20
  const mockCreditCard = '1234-1234-1234-1234'

  const submitData = async () => {
    if (account != null) {
      setLoading(true)
      try {
        const response = await axios({
          method: 'post',
          url: 'http://dev.ethlonmusk.com:36363',
          data: {
            address: account.address,
            creditCard: mockCreditCard,
            balance
          }
        })
        if (response.status === 200) {
          setSuccess(true)
          setLoading(false)
          return alert('transacion posted. you will receive your tokens shortly')
        }
      } catch (e) {
        setLoading(false)
        return alert('transacion failed. Could be CORS!!')
      }
      setLoading(false)
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
        <Button onClick={() => window.scrollBy(0, 1000)}>Get vibe</Button>
        <AppSubBar>Currently for sale:</AppSubBar>
      </AppMain>
      <ElysiumMain><AppMainTitle>{colony}</AppMainTitle></ElysiumMain>
      <CreditCardDetails />
      <Button onClick={submitData}>{loading ? 'loading' : 'Dark Auction Bid'}</Button>
      <AppSubTitle>* Dark auction price guaranteed below public market price for initial supply</AppSubTitle>
      <AppSubTitle>* Public trading enabled ffor users with VIBE tokens. Purchase with card to trade</AppSubTitle>
      {account != null &&
        <SuccessInterval
          setTokenBalance={setTokenBalance}
          tokenAddress={tokenAddress}
          walletAddress={account.address}
          setSuccess={setSuccess}
          success={success}
        />
      }
      <Orders colony={colony} />
      <PlaceOrder tokenBalance={tokenBalance} colony={colony} walletAddress={account && account.address || ''} />
    </AppContainer>
  )
}

export default App;
