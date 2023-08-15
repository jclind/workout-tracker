import React, { useState, useEffect } from 'react'
import './Account.scss'
import UserDetails from '../../Components/UserDetails/UserDetails'
import { useParams } from 'react-router-dom'
import { getUserData } from '../../services/auth'
import { UserProfileDataType } from '../../types'

const Account = () => {
  const [userData, setUserData] = useState<UserProfileDataType | null>(null)
  const { username } = useParams()

  useEffect(() => {
    if (username) {
      getUserData(username).then(res => {
        setUserData(res)
        console.log(res)
      })
    }
  }, [])

  return (
    <div className='account-page'>
      {userData && <UserDetails userData={userData} />}
    </div>
  )
}

export default Account
