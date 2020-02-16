import React, { FC, Dispatch, SetStateAction } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { VibeTag, Container } from './VibeSelectStyles'
import { Vibe } from './App'
import { Label } from './AppStyles'

interface VibeSelectProps {
  setColony: Dispatch<SetStateAction<string>>
  vibes: Array<Vibe>
}

export const VibeSelect: FC<VibeSelectProps> = ({ setColony, vibes }) => (
  <Container>
    Select a colony
    {vibes.map(({ name }, index) => (
      <VibeTag key={index} onClick={() => setColony(name)}>{name}</VibeTag>
    ))}
  </Container>
)
