import React, { useEffect, useState } from 'react'
import './Friends.scss'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import FriendsList from '../../Components/FriendsPage/FriendsList/FriendsList'
import { getNumRequested, getNumberOfFriends } from '../../services/friends'
import { getUsername } from '../../services/auth'

const Friends = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathParts = location.pathname.split('/')
  const endPath = pathParts[pathParts.length - 1]

  const [numRequested, setNumRequested] = useState<number | null>(null)
  const [numFriends, setNumFriends] = useState<number | null>(null)

  const [currUsername, setCurrUsername] = useState<string | null>(null)

  useEffect(() => {
    getUsername().then(res => setCurrUsername(res || null))
  })
  useEffect(() => {
    if (currUsername) {
      if (!location.pathname.includes(`/user/${currUsername}/friends`)) {
        navigate('/')
      } else {
        getNumRequested().then(res => {
          setNumRequested(res ?? null)
        })
        getNumberOfFriends().then(res => {
          setNumFriends(res ?? null)
        })
      }
    }
  }, [currUsername])

  // if (currUsername && location.pathname.includes(`/users/${currUsername}`))

  return (
    <div className='friends-page'>
      <div className='title'>Friends page</div>
      <div className='page-options'>
        <Link
          to='requested'
          className={`link ${endPath === 'requested' ? 'active' : ''}`}
        >
          Requests {numRequested ? `(${numRequested})` : ''}
        </Link>
        <Link to='' className={`link ${endPath === 'friends' ? 'active' : ''}`}>
          Friends {numFriends ? `(${numFriends})` : ''}
        </Link>
        <Link
          to='pending'
          className={`link ${endPath === 'pending' ? 'active' : ''}`}
        >
          Pending
        </Link>
        <div className={`selected-indicator ${endPath}`}></div>
      </div>
      {location.pathname === `/user/${currUsername}/friends` ? (
        <FriendsList />
      ) : (
        <Outlet />
      )}
    </div>
  )
}

export default Friends
