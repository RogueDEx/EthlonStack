import styled from 'styled-components'

import { WidthContainer } from './AppStyles'

export const PlaceOrderFieldsContainer = styled(WidthContainer)`
  display: flex;
  flex-direction: column;
  width: 150px;
  text-align: center;
`

export const CustomInput = styled.input`
  height: 20px;
  width: 100px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin: 10px auto;
`
