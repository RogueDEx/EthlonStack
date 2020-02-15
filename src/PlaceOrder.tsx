import React, { FC, useState } from "react"

import { PlaceOrderFields } from './PlaceOrderFields'
import { Label, WidthContainer, Button } from './AppStyles'
import { AssetPriceTitle, AssetPrice, InnerContainer } from './PlaceOrderStyles'

interface PlaceOrderProps {
  colony: string
}

export const PlaceOrder: FC<PlaceOrderProps> = ({ colony }) => {
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
    <WidthContainer>
      <Label>Order bid</Label>
      <InnerContainer>
        <PlaceOrderFields label="Input" type={input} setAmount={setInputAmount} />
        <div onClick={() => {
          setInput(output)
          setOutput(input)
        }}>{`<-->`}</div>
        <PlaceOrderFields label="Output" type={output} setAmount={setOutputAmount} />
      </InnerContainer>
      <AssetPriceTitle>Asset Price</AssetPriceTitle>
      <AssetPrice>
        {assetPrice}
      </AssetPrice>
      <Button onClick={placeOrder}>Place bid</Button>
    </WidthContainer>
  )
}
