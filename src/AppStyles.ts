import styled from 'styled-components'

export const AppContainer = styled.div`
  padding: 30px;
`

export const WidthContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`

export const Button = styled.div`
  background: palevioletred;
  border-radius: 3px;
  border: none;
  color: white;
  width: 120px;
  padding: 3px;
  text-align: center;
  margin: 10px auto;
  cursor: pointer;
`

export const Title = styled.div`
  font-size: 36px;
  margin: 20px auto;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`

export const Label = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
`
