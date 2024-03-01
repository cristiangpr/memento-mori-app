/* eslint-disable react/function-component-definition */
/* eslint-disable no-nested-ternary */
import { Title, Icon, Loader, Button, Text } from '@gnosis.pm/safe-react-components'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { Container, LeftColumn, RightColumn, Row, StyledTitle } from './FormElements'
import { ReactComponent as Logo } from '../mmlogo.svg'

export const Landing: React.FC = () => {
  return (
    <Container>
      <Logo style={{ margin: '10px' }} />
      <Row style={{ width: '65%' }}>
        <StyledTitle size="md">Embrace the Future</StyledTitle>
        <Text size="lg">
          Introducing Memento Mori-the platform that empowers you to safeguard your digital wealth for future
          generations.
        </Text>
      </Row>

      <Row style={{ width: '65%' }}>
        <LeftColumn>
          <StyledTitle size="sm">Secure your digital legacy</StyledTitle>
          <Text size="sm">
            Design your digital legacy effortlessly with our user-friendly form. Memento Mori provides a comprehensive
            platform to draft, modify, and update your crypto will with ease.
          </Text>
        </LeftColumn>
        <RightColumn style={{ justifyContent: 'center', alignItems: 'center' }}>
          <NavLink to="/myWill">
            <Button size="md">Create Will</Button>
          </NavLink>
        </RightColumn>
      </Row>
      <Row style={{ width: '65%', justifyContent: 'center' }}>
        <LeftColumn>
          <StyledTitle size="sm">Peace of Mind</StyledTitle>
          <Text size="sm">
            As a beneficiary, gaining access to your designated assets is a simple process. Request the execution of a
            will with a click, and let Memento Mori handle the rest.
          </Text>
        </LeftColumn>
        <RightColumn style={{ justifyContent: 'center', alignItems: 'center' }}>
          <NavLink to="/execute">
            <Button size="md">Execute Will</Button>
          </NavLink>
        </RightColumn>
      </Row>
    </Container>
  )
}
