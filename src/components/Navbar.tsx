import React, { useState } from 'react'
import { Bars, MobileNav, MobileNavLink, Nav, NavLink, NavMenu } from './NavbarElements'
import { ReactComponent as Icon } from '../icon.svg'

function Navbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Nav>
        <Icon style={{ transform: 'scale(0.4)', marginBottom: '-10px', marginTop: '-10px' }} />
        <NavMenu>
          <NavLink to="/myWill">My Will</NavLink>
          <NavLink to="/execute">Execute</NavLink>
        </NavMenu>
        <Bars onClick={() => setIsOpen(!isOpen)} />
      </Nav>
      <MobileNav isOpen={isOpen}>
        <MobileNavLink to="/myWill" onClick={() => setIsOpen(false)}>
          My Will
        </MobileNavLink>
        <MobileNavLink to="/execute" onClick={() => setIsOpen(false)}>
          Execute
        </MobileNavLink>
      </MobileNav>
    </>
  )
}

export default Navbar
