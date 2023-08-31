import React, { useState, useEffect } from 'react'
import './Account.scss'
import UserDetails from '../../Components/UserDetails/UserDetails'
import { useParams } from 'react-router-dom'
import { getUserData, getUsername } from '../../services/auth'
import { FriendsStatusType, UserProfileDataType } from '../../types'
import toast from 'react-hot-toast'
import FriendsList from '../../Components/FriendsList/FriendsList'
import {
  checkIfFriends,
  getFriendshipStatus,
  getNumberOfFriends,
} from '../../services/friends'
import FriendStatusButton from '../../Components/FriendStatusButton/FriendStatusButton'
import LastWorkout from '../../Components/LastWorkout/LastWorkout'

const Account = () => {
  const [userData, setUserData] = useState<UserProfileDataType | null>(null)
  const [numFriends, setNumFriends] = useState<number | null>(null)
  const [currUserIsAuthor, setCurrUserIsAuthor] = useState<boolean | null>(null)
  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendsStatusType | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(true)
  const { username } = useParams()

  const checkCurrUserIsAuthor = async (username: string) => {
    const currUsername = await getUsername()
    setCurrUserIsAuthor(currUsername === username)
  }

  const getUserDetails = async (username: string) => {
    const p1 = getUserData(username)
      .then(res => {
        setUserData(res)
      })
      .catch((error: any) => {
        toast.error(error, { position: 'bottom-center' })
      })
    const p2 = getNumberOfFriends(username).then(res => {
      setNumFriends(res || 0)
    })
    const p3 = checkCurrUserIsAuthor(username)
    await Promise.all([p1, p2, p3])
  }
  useEffect(() => {
    if (username) {
      getUserDetails(username).then(() => setUserDetailsLoading(false))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  useEffect(() => {
    if (currUserIsAuthor === false && username) {
      getFriendshipStatus(username).then(res => {
        if (res) {
          setFriendshipStatus(res)
        } else {
          setFriendshipStatus('not_friends')
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currUserIsAuthor])

  // const handleAddFriend = () => {
  //   if (username) {
  //     addFriend(username)
  //     setFriendshipStatus('pending')
  //   }
  // }

  if (!username) return null

  return (
    <div className='account-page'>
      <UserDetails
        userData={userData}
        loading={userDetailsLoading}
        setLoading={setUserDetailsLoading}
        numFriends={numFriends}
      />
      {currUserIsAuthor && <LastWorkout />}
      {currUserIsAuthor === false && friendshipStatus && (
        <FriendStatusButton
          friendshipStatus={friendshipStatus}
          setFriendshipStatus={setFriendshipStatus}
          accountUsername={username}
        />
      )}

      {currUserIsAuthor && <FriendsList />}
    </div>
  )
}

export default Account
