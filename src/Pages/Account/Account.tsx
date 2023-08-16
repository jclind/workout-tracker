import React, { useState, useEffect } from 'react'
import './Account.scss'
import UserDetails from '../../Components/UserDetails/UserDetails'
import { useParams } from 'react-router-dom'
import { getUserData } from '../../services/auth'
import { UserProfileDataType } from '../../types'
import toast from 'react-hot-toast'

const Account = () => {
  const [userData, setUserData] = useState<UserProfileDataType | null>(null)
  const { username } = useParams()

  useEffect(() => {
    if (username) {
      getUserData(username)
        .then(res => {
          setUserData(res)
        })
        .catch((error: any) => {
          toast.error(error, { position: 'bottom-center' })
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='account-page'>
      {userData && <UserDetails userData={userData} />}
    </div>
  )
}

export default Account
