import React from 'react'
import './Nav.scss'
import { logout } from '../../services/auth'
const Nav = () => {
  return (
    <nav>
      <button className='btn-no-styles logout-btn' onClick={logout}>
        Logout
      </button>
    </nav>
  )
}

export default Nav
