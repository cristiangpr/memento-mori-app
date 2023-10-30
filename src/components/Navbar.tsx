import React from 'react'
import { Nav, NavLink, NavMenu, NavBtn, NavBtnLink } from './NavbarElements'

function Navbar(): React.ReactElement {
  return (
    <Nav>
      <NavMenu>
        <NavLink to="/">Create Will</NavLink>
        <NavLink to="/execute">Execute</NavLink>

        {/* Second Nav */}
        {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
      </NavMenu>
    </Nav>
  )
}

export default Navbar
