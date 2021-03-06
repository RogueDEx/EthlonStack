import styled from 'styled-components'

import { WidthContainer } from './AppStyles'

export const Container = styled(WidthContainer)`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  margin-top: 50px;
`

export const HalfFieldContainer = styled.div`
  display: flex;
`

export const HalfField = styled.div`
  width: 30%;
  border: 1px solid #e09b7e;
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 3px;
  margin-right: 10px;
`

export const Field = styled(HalfField)`
  width: 100%;
  height: 20px;
  margin-right: 0;
  margin-bottom: 10px;
`

