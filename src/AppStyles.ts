import styled from 'styled-components'

export const WidthContainer = styled.div`
  max-width: 600px;
  padding: 50px;
  margin: 0 auto;
`

export const Button = styled.div`
  background: #e09b7e;
  border-radius: 3px;
  border: none;
  color: white;
  width: 120px;
  padding: 3px;
  text-align: center;
  margin: 10px auto;
  cursor: pointer;
`

export const ColonyTitle = styled.div`
  font-size: 20px;
  padding-top: 20px;
  padding-right: 25px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

export const AppTitle = styled.div`
  font-size: 32px;
  padding-top: 10px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`

export const Label = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
`

export const AppHeader = styled.div`
  width: 100%;
  background: black;
  color: white;
  height: 100px;
  padding-top: 40px;
  border-bottom: 1px solid white;
  display: flex;
  justify-content: space-between;
`

export const AppLogo = styled.div`
  float: left;
  padding-top: 20px;
  padding-left: 50px;
  display: flex;
`
export const AppLogoText = styled.div`
  font-size: 20px;
`

export const AppImage = styled.img`
  height: 50px;
  margin-left: 20px;
  margin-top: -15px;
`

export const AppMain = styled.div`
  background-image: url("/mars.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  height: 400px;
  color: white;
  font-size: 44px;
  text-align: center;
  padding-top: 40px;
`

export const AppMainTitle = styled.div`
  font-style: italic;
`
