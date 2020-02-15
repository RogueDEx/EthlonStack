import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
`

export const HalfFieldContainer = styled.div`
  display: flex;
`

export const HalfField = styled.div`
  width: 30%;
  border: 1px solid palevioletred;
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 3px;
  margin-right: 10px;
`

export const Field = styled(HalfField)`
  width: 100%;
  margin-right: 0;
`

