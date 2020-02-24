import React, { FC, useEffect, useState } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import axios from 'axios'

import erc20Json from './abi/erc20.json'
import erc721Json from './abi/erc721.json'
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
import { useInterval } from './hooks/useInterval'

const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')

export interface Vibe {
  name: string
  tokenAddress: string
  tokenBalance: number
}

const App: FC = () => {
  const E = web3.eth;
  const U = web3.utils;
  // @ts-ignore
  const range = n => [...Array(Number(n)).keys()]
  const id2addr = (id: string) => U.toChecksumAddress(U.padLeft(U.toHex(id),40));

  const contractCacheData:{[x:string]:any} = {};
  const contractCache = (abi: any, addr: string) => contractCacheData[addr] || (contractCacheData[addr] = new E.Contract(abi, addr) )
  const aRogueHolder =  "0x8F4F8101C9D2017Be850f00B6f927a603475167f"
  let rogueHolder = contractCache(erc721Json, aRogueHolder)
  let walletContents = {USD:0,VIBEE:0};
  
  const colony = 'Elysium'
  const aVibeE = '0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6'
  const aVibeUSDEQ = "0x4aEb09074448892ea75D34D3e59369F37a166adE";
  const [account, setAccount] = useState<Account | null>(null)
  const [vibeBalance, setVibeBalance] = useState<number>(0)
  const [usdBalance, setUsdBalance] = useState<number>(0)
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const privateKey = localStorage.getItem('privateKey')
  // const privateKey = "0x1ed4a78eada0b037bb157f6750ac7fd6b6ad99fe021e276c2761f8708eb63447"
  let a = privateKey == null ?
  E.accounts.create() :
  E.accounts.privateKeyToAccount(privateKey)
  if(account==null){
    setAccount(a)
  }
  if (privateKey == null) {
    localStorage.setItem('privateKey', a.privateKey);
  }
  const userAddress: string = a.address
  const CVibeE: Contract = new E.Contract(erc20Json as any, aVibeE)
  const CUsd: Contract = new E.Contract(erc20Json as any, aVibeUSDEQ)
  const CRogue: Contract = new E.Contract(erc721Json as any, aRogueHolder)

  const checkForRogue = (from:any) =>
  rogueHolder.methods.balanceOf(from).call() // call as target even though no private key
    .then( (n:any) => Promise.all( 
      range(n).map( (i:number) => ( rogueHolder.methods.tokenOfOwnerByIndex(from, i).call({from}) ) )// return object id
    ))
    .then( (list:any) => list.map(id2addr) )// converts to proper address
    .then((list:string[]) => {
      if(list.length!=0){
        console.log(list[0])
        return list[0]
      }else{
        return 'none'
      }
    })

  const checkRogueBalances = (r:string) => {
    if(r!='none'){
      CVibeE.methods.balanceOf(r).call()
      .then( (bal:any) => {walletContents['VIBEE']=bal} )
      .then(() => CUsd.methods.balanceOf(r).call()
      .then( (bal:any) => {walletContents['USD']=bal} ))
      .then(() => {
        setVibeBalance(walletContents['VIBEE']*Math.pow(10,-18))
        setUsdBalance(walletContents['USD']*Math.pow(10,-18))
      })
    }
  }
    

  useInterval(() => {
    (new Promise( r=> r(true) ))
    .then(() => checkForRogue(userAddress))// Check Holder for first rogue owned by user
    .then((radd:string) => checkRogueBalances(radd))// Check Rogue Balance for USD & VibeE
  }, 10000)


  // Mock data
  const balance = 100 * Math.random() + 20
  const mockCreditCard = '1234-1234-1234-1234'

  const submitData = async () => {
    if (account != null) {
      setLoading(true)
      try {
        const response = await axios({
          method: 'post',
          // url: 'http://dev.ethlonmusk.com:36363',
          // url: 'http://localhost:36363',
          url: "./thing",
          data: {
            address: account.address,
            creditCard: mockCreditCard,
            balance
          }
        })
        if (response.status === 200) {
          setSuccess(true)
          setLoading(false)
          return alert('Transaction posted. You will receive your tokens shortly...')
        }
      } catch (e) {
        setLoading(false)
        return alert('Transaction failed. Could be CORS!!')
      }
      setLoading(false)
      return alert('Transacion failed. Please contact support...')
    } else {
      alert('There is no account.')
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
        <AppSubTitle>Secured on Ethereum. No gas required.</AppSubTitle>
        <Button onClick={() => window.scrollBy(0, 1000)}>Get vibe</Button>
        <AppSubBar>Currently for sale:</AppSubBar>
      </AppMain>
      <ElysiumMain><AppMainTitle>{colony}</AppMainTitle></ElysiumMain>
      <CreditCardDetails />
      <Button onClick={submitData}>{loading ? 'loading' : 'Dark Auction Bid'}</Button>
      <AppSubTitle>* Dark auction price is guaranteed to be below public market price for initial supply.</AppSubTitle>
      <AppSubTitle>* Public trading enabled for users with VIBE tokens. Purchase with card to trade.</AppSubTitle>
      {account != null &&
        <SuccessInterval
          setTokenBalance={setVibeBalance}
          tokenAddress={aVibeE}
          walletAddress={account.address}
          setSuccess={setSuccess}
          success={success}
        />
      }
      <Orders colony={colony} />
      <PlaceOrder vibeBalance={vibeBalance} usdBalance={usdBalance} colony={colony} rogueAddress={account && account.address || ''} web3={web3} />
    </AppContainer>
  )
}

export default App;
