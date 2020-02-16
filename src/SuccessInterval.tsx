import React from 'react'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

import { useInterval } from './hooks/useInterval'
import erc20Json from './abi/erc20.json'

interface SuccessIntervalProps {
  setTokenBalance: (balance: number) => void
  setSuccess: (success: boolean) => void
  tokenAddress: string
  walletAddress: string
  success: boolean
}

export const SuccessInterval: React.FC<SuccessIntervalProps> = (
  { setTokenBalance, tokenAddress, walletAddress, setSuccess, success }
) => {
  useInterval(() => {
    async function checkBalance() {
      const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/88763c0ddb9b411dbcc2e6d1e4c1a5ac')
      // @ts-ignore
      const contract: Contract = new web3.eth.Contract(erc20Json, tokenAddress)
      const fetchBalance = await contract.methods.balanceOf(walletAddress).call()
      const formattedBalance = Number(fetchBalance)
      if (formattedBalance > 0) {
        setTokenBalance(formattedBalance)
        return setSuccess(false)
      }
    }
    checkBalance()
  }, success ? 6000 : 20000);

  return null
}
