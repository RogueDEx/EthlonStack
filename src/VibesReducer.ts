import { Reducer } from 'react'
import { Vibe } from './App'

interface IUpdateBalance {
  type: 'update-balance'
  tokenBalance: number
  name: string
}

export const initialState: Vibe[] = [
  { name: 'Elysium', tokenAddress: '', tokenBalance: 0 },
  { name: 'Hellas', tokenAddress: '', tokenBalance: 0 },
  { name: 'Planum Australe', tokenAddress: '', tokenBalance: 0 },
  { name: 'Meridiani Planum', tokenAddress: '', tokenBalance: 0 }
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
