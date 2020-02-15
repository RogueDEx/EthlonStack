import React, { FC, useState } from "react"

import { PlaceOrderFields } from './PlaceOrderFields'
import { Label, WidthContainer } from './AppStyles'
import { AssetPriceTitle, AssetPrice, InnerContainer } from './PlaceOrderStyles'

interface PlaceOrderProps {
  colony: string
}

export const PlaceOrder: FC<PlaceOrderProps> = ({ colony }) => {
  const [input, setInput] = useState<string>(colony)
  const [output, setOutput] = useState<string>('USD')
  const [inputAmount, setInputAmount] = useState<string>('0')
  const [outputAmount, setOutputAmount] = useState<string>('0')

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
        {Number(inputAmount) / Number(outputAmount)}
      </AssetPrice>
    </WidthContainer>
  )
}
