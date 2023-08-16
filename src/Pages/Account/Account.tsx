import React, { useState, useEffect } from 'react'
import './Account.scss'
import UserDetails from '../../Components/UserDetails/UserDetails'
import { useParams } from 'react-router-dom'
import { getUserData, getUsername } from '../../services/auth'
import { UserProfileDataType } from '../../types'
import toast from 'react-hot-toast'
import FriendsList from '../../Components/FriendsList/FriendsList'

const Account = () => {
  const [userData, setUserData] = useState<UserProfileDataType | null>(null)
  const [currUserIsAuthor, setCurrUserIsAuthor] = useState<boolean | null>(null)
  const { username } = useParams()

  const checkCurrUserIsAuthor = async (username: string) => {
    const currUsername = await getUsername()
    setCurrUserIsAuthor(currUsername === username)
  }
  useEffect(() => {
    if (username) {
      getUserData(username)
        .then(res => {
          setUserData(res)
        })
        .catch((error: any) => {
          toast.error(error, { position: 'bottom-center' })
        })
      checkCurrUserIsAuthor(username)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='account-page'>
      {userData && <UserDetails userData={userData} />}
      {currUserIsAuthor && <FriendsList />}
    </div>
  )
}

export default Account
