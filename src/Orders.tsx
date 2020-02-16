import React, { FC, useState } from "react"
import Web3 from 'web3'
import moment from 'moment'

import ordersJson from './abi/orders.json'
import { OrderGrid } from './OrderGrid'
import { MainLabel } from './AppStyles'
import { OrdersContainer } from './OrdersStyles'
import { OrdersType } from './OrderGrid'
import { useInterval } from './hooks/useInterval'

interface OrdersProps {
  colony: string
}

export const Orders: FC<OrdersProps> = ({ colony }) => {
  const [buyOrders, setBuyOrders] = useState<OrdersType[] | null>(null)
  const [sellOrders, setSellOrders] = useState<OrdersType[] | null>(null)

  useInterval(() => {
    async function getOrders() {
      const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
      const orderBookAddress = ''
      // @ts-ignore
      // const contract: Contract = new web3.eth.Contract(ordersJson, orderBookAddress)
      // const ordersResponse = await contract.methods.getOrderRow(0).call()
      // console.log('ordersResponse', ordersResponse)
      // TODO Evan -> parse the response into arrays of sell and buy orders
      // TODO use moment to format the time
      const formatttedBuyOrders = [{
        price: 0.75,
        amount: 20,
        expires: '1hr'
      }]
      const formatttedSellOrders = [{
        price: 1.00,
        amount: 25,
        expires: '1hr'
      }]
      setBuyOrders(formatttedBuyOrders)
      setSellOrders(formatttedSellOrders)
    }
    getOrders()
  }, 5000)

  return (
    <OrdersContainer>
      <MainLabel>Elysium public order book</MainLabel>
      <OrderGrid label="Buyers" colony={colony} orders={buyOrders || []} />
      <OrderGrid label="Sellers" colony={colony} orders={sellOrders || []} />
    </OrdersContainer>
  )
}
