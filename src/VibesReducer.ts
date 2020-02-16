import { Reducer } from 'react'
import { Vibe } from './App'

interface IUpdateBalance {
  type: 'update-balance'
  tokenBalance: number
  name: string
}

export const initialState: Vibe[] = [
  { name: 'Elysium', tokenAddress: '0xd2e48a20b4c4F733604d336dB872b747Cd0Ffbe6', tokenBalance: 0 }
]

export const reducer: Reducer<Vibe[], IUpdateBalance> = (
  state,
  action
) => {
  switch (action.type) {
    case 'update-balance': {
      const { tokenBalance, name } = action
      const newState = state.map(vibe => {
        const newVibe = { ...vibe }
        if (newVibe.name === name) {
          newVibe.tokenBalance = tokenBalance
        }
        return newVibe
      })
      return newState
    }
    default:
      return state
  }
}
