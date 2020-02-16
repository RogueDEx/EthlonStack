import React, { FC, useState } from "react"
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

import erc721Json from './abi/erc721.json'
import { useInterval } from './hooks/useInterval'
import { PlaceOrderFields } from './PlaceOrderFields'
import { MainLabel, Button } from './AppStyles'
import { AssetPriceTitle, AssetPrice, InnerContainer, PlaceOrderContainer } from './PlaceOrderStyles'

interface PlaceOrderProps {
  colony: string
  tokenBalance: number
  walletAddress: string
}

export const PlaceOrder: FC<PlaceOrderProps> = ({ colony, tokenBalance, walletAddress }) => {
  const [input, setInput] = useState<string>(colony)
  const [output, setOutput] = useState<string>('USD')
  const [usdBalance, setUsdBalance] = useState<number>(0)
  const [inputAmount, setInputAmount] = useState<number>(0)
  const [outputAmount, setOutputAmount] = useState<number>(0)

  useInterval(() => {
    async function checkBalance() {
      if (walletAddress === '') {
        return
      }
      const usdContractAddress = ''
      const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
      // @ts-ignore
      const contract: Contract = new web3.eth.Contract(erc721Json, usdContractAddress)
      const someResponseToParse = await contract.methods.ownedBy(walletAddress).call()
      console.log('someResponseToParse response', someResponseToParse)
      const formattedBalance = Number(someResponseToParse)
      if (formattedBalance > 0) {
        return setUsdBalance(formattedBalance)
      }
    }
    checkBalance()
  }, 10000);

  const assetPrice = inputAmount !== 0 && outputAmount !== 0 ?
    output === 'USD' ?
      `${(outputAmount / inputAmount).toFixed(4)} ${output} per ${input}` :
      `${(inputAmount / outputAmount).toFixed(4)} ${input} per ${output}`
    : ''

  const placeOrder = async () => {
    if (inputAmount === 0 || outputAmount === 0) {
      alert('please enter both an input and output amount')
    }
    const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
    // @ts-ignore
    const contract: Contract = new web3.eth.Contract(erc721Json, usdContractAddress)
    const response = await contract.methods.updateRow().call()
    console.log('sorry', response)
  }

  return (
    <PlaceOrderContainer>
      <MainLabel>{`You have ${tokenBalance} Elysium tokens`}</MainLabel>
      <MainLabel>{`You have ${usdBalance} USD tokens`}</MainLabel>
      <MainLabel>Place public order</MainLabel>
      <InnerContainer>
        <PlaceOrderFields label="Input" type={input} setAmount={setInputAmount} tokenBalance={tokenBalance} />
        <div onClick={() => {
          setInput(output)
          setOutput(input)
        }}>{`<-->`}</div>
        <PlaceOrderFields label="Output" type={output} setAmount={setOutputAmount} tokenBalance={tokenBalance} />
      </InnerContainer>
      <AssetPriceTitle>Asset Price</AssetPriceTitle>
      <AssetPrice>
        {assetPrice}
      </AssetPrice>
      <Button onClick={placeOrder}>{tokenBalance === 0 ? 'Purchase to bid' : 'Place bid'}</Button>
    </PlaceOrderContainer>
  )
}
