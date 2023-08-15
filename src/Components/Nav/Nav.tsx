import React from 'react'
import './Nav.scss'
import { logout } from '../../services/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AiOutlineHome,
  AiOutlineLineChart,
  AiOutlineUser,
} from 'react-icons/ai'
import { useUsername } from '../../App'

const Nav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currPage = location.pathname.split('/').pop()
  const { username } = useUsername()

  return (
    <nav>
      <div className='links'>
        <button
          className={`btn-no-styles home-btn ${
            currPage === '' ? 'active' : ''
          }`}
          onClick={() => navigate('/')}
        >
          <AiOutlineHome className='icon' />
        </button>
        <button
          className={`btn-no-styles account-btn ${
            currPage === 'account' ? 'active' : ''
          }`}
          onClick={() => navigate(`/user/${username}`)}
        >
          <AiOutlineUser className='icon' />
        </button>
        <button
          className={`btn-no-styles exercise-charts-btn ${
            currPage === 'charts' ? 'active' : ''
          }`}
          onClick={() => navigate('/charts')}
        >
          <AiOutlineLineChart className='icon' />
        </button>
      </div>
      <button className='btn-no-styles logout-btn' onClick={logout}>
        Logout
      </button>
    </nav>
  )
}

export default Nav
