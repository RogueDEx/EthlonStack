import React, { FC, Dispatch, SetStateAction } from 'react'
import Web3 from 'web3'
import { Account } from 'web3-core'

import { VibeTag, Container } from './VibeSelectStyles'
import { Label } from './AppStyles'

interface VibeSelectProps {
  setColony: Dispatch<SetStateAction<string>>
}

export const VibeSelect: FC<VibeSelectProps> = ({ setColony }) => (
  <Container>
    Select a colony
    {['Elysium', 'Hellas', 'Planum Australe', 'Meridiani Planum'].map((colony, index) => (
      <VibeTag key={index} onClick={() => setColony(colony)}>{colony}</VibeTag>
    ))}
  </Container>
)
