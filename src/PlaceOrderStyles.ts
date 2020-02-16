import styled from 'styled-components'

import { WidthContainer } from './AppStyles'

export const PlaceOrderContainer = styled(WidthContainer)`
  background: white;
  border-radius: 8px;
  margin-top: 50px;
`

export const InnerContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 10px 0;
`

export const AssetPriceTitle = styled.div`
  text-align: center;
`

export const AssetPrice = styled.div`
  margin-bottom: 60px;
  text-align: center;
`
