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
  vibeBalance: number
  usdBalance: number
  rogueAddress: string
  web3: Web3
}

export const PlaceOrder: FC<PlaceOrderProps> = ({ colony, vibeBalance, usdBalance, rogueAddress, web3 }) => {
  const [input, setInput] = useState<string>(colony)
  const [output, setOutput] = useState<string>('USD')
  const [inputAmount, setInputAmount] = useState<number>(0)
  const [outputAmount, setOutputAmount] = useState<number>(0)

  const assetPrice = inputAmount !== 0 && outputAmount !== 0 ?
    output === 'USD' ?
      `${(outputAmount / inputAmount).toFixed(4)} ${output} per ${input}` :
      `${(inputAmount / outputAmount).toFixed(4)} ${input} per ${output}`
    : ''

  const placeOrder = async () => {
    if (inputAmount === 0 || outputAmount === 0) {
      alert('please enter both an input and output amount')
    }
    // @ts-ignore
    const contract: Contract = new web3.eth.Contract(erc721Json, usdContractAddress)
    const response = await contract.methods.updateRow().call()
    console.log('sorry', response)
  }

  return (
    <PlaceOrderContainer>
      <MainLabel>{`You have ${vibeBalance} Elysium token(s)`}</MainLabel>
      <MainLabel>{`You have ${usdBalance} USD`}</MainLabel>
      <MainLabel>Place public order</MainLabel>
      <InnerContainer>
        <PlaceOrderFields label="Input" type={input} setAmount={setInputAmount} tokenBalance={vibeBalance} />
        <div onClick={() => {
          setInput(output)
          setOutput(input)
        }}>{`<-->`}</div>
        <PlaceOrderFields label="Output" type={output} setAmount={setOutputAmount} tokenBalance={usdBalance} />
      </InnerContainer>
      <AssetPriceTitle>Asset Price</AssetPriceTitle>
      <AssetPrice>
        {assetPrice}
      </AssetPrice>
      <Button onClick={placeOrder}>{vibeBalance === 0 ? 'Purchase to bid' : 'Place bid'}</Button>
    </PlaceOrderContainer>
  )
}
