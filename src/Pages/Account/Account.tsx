import React, { useState, useEffect } from 'react'
import './Account.scss'
import UserDetails from '../../Components/UserDetails/UserDetails'
import { useParams } from 'react-router-dom'
import { getUserData, getUsername } from '../../services/auth'
import { FriendsStatusType, UserProfileDataType } from '../../types'
import toast from 'react-hot-toast'
import FriendsList from '../../Components/FriendsList/FriendsList'
import {
  addFriend,
  checkIfFriends,
  getPendingFriendRequest,
} from '../../services/friends'

const Account = () => {
  const [userData, setUserData] = useState<UserProfileDataType | null>(null)
  const [currUserIsAuthor, setCurrUserIsAuthor] = useState<boolean | null>(null)
  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendsStatusType | null>(null)
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
  }, [username])

  useEffect(() => {
    if (currUserIsAuthor === false && username) {
      checkIfFriends(username).then(res => {
        if (res) {
          setFriendshipStatus(res)
        } else {
          setFriendshipStatus('not_friends')
        }
      })
      getPendingFriendRequest()
    }
  }, [currUserIsAuthor])

  const handleAddFriend = () => {
    if (username) {
      addFriend(username)
      setFriendshipStatus('pending')
    }
  }

  if (!username) return null

  return (
    <div className='account-page'>
      {userData && <UserDetails userData={userData} />}
      {currUserIsAuthor === false && (
        <>
          {friendshipStatus === 'not_friends' ? (
            <button
              className='submit-btn add-friend-btn'
              onClick={handleAddFriend}
            >
              Add Friend
            </button>
          ) : friendshipStatus === 'requested' ? (
            <button className='submit-btn add-friend-btn'>
              Accept Friend Request
            </button>
          ) : friendshipStatus === 'pending' ? (
            <button className='submit-btn add-friend-btn pending'>
              Pending
            </button>
          ) : null}
        </>
      )}

      {currUserIsAuthor && <FriendsList />}
    </div>
  )
}

export default Account
