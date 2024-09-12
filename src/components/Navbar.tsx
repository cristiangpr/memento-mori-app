import React from 'react'
import { Nav, NavLink, NavMenu } from './NavbarElements'
import { ReactComponent as Icon } from '../icon.svg'

function Navbar(): React.ReactElement {
  return (
    <Nav>
      <Icon style={{ transform: 'scale(0.4)', marginBottom: '-10px', marginTop: '-10px' }} />
      <NavMenu>
        <NavLink to="/myWill">My Will</NavLink>
        <NavLink to="/execute">Execute</NavLink>

        {/* Second Nav */}
        {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
      </NavMenu>
    </Nav>
  )
}

export default Navbar
