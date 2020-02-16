import React, { FC, useState } from "react"

import { PlaceOrderFields } from './PlaceOrderFields'
import { MainLabel, Button } from './AppStyles'
import { AssetPriceTitle, AssetPrice, InnerContainer, PlaceOrderContainer } from './PlaceOrderStyles'

interface PlaceOrderProps {
  colony: string
  tokenBalance: number
}

export const PlaceOrder: FC<PlaceOrderProps> = ({ colony, tokenBalance }) => {
  const [input, setInput] = useState<string>(colony)
  const [output, setOutput] = useState<string>('USD')
  const [inputAmount, setInputAmount] = useState<number>(0)
  const [outputAmount, setOutputAmount] = useState<number>(0)

  const assetPrice = inputAmount !== 0 && outputAmount !== 0 ?
    output === 'USD' ?
      `${(outputAmount / inputAmount).toFixed(4)} ${output} per ${input}` :
      `${(inputAmount / outputAmount).toFixed(4)} ${input} per ${output}`
    : ''

  const placeOrder = () => {
    if (inputAmount === 0 || outputAmount === 0) {
      alert('please enter both an input and output amount')
    }
    console.log('place order here')
  }

  return (
    <PlaceOrderContainer>
      <MainLabel>{`You have ${tokenBalance} Elysium tokens`}</MainLabel>
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
