import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'

export const Nav = styled.nav`
  background: rgb(31 41 55);
  height: 85px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem calc((100vw - 1000px) / 2);
  z-index: 10;
`

export const NavLink = styled(Link)`
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  font-size: 20px;
  font-family: Averta, Roboto, 'Helvetica Neue', Arial, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',
    -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  &.active {
    color: ${(props) => props.theme.colors.primary};
  }
  &:hover {
    color: rgb(81, 218, 207);
  }
`

export const Bars = styled(FaBars)`
  display: none;
  color: #fff;
  font-size: 1.8rem;
  cursor: pointer;

  @media screen and (max-width: 768px) {
    display: block;
  }
`

export const NavMenu = styled.div`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`

interface MobileNavProps {
  isOpen: boolean
}

export const MobileNav = styled.div<MobileNavProps>`
  display: none;

  @media screen and (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    background: rgb(31 41 55);
    position: absolute;
    top: 85px;
    left: 0;
    right: 0;
    width: 100%;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`

export const MobileNavLink = styled(NavLink)`
  padding: 15px 0;
`
