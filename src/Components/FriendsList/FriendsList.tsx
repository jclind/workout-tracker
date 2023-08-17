import React, { useState, useEffect } from 'react'
import './FriendsList.scss'
import { getPendingFriendRequests } from '../../services/friends'
import { CombinedFriendDataType, UserFriendsListArrType } from '../../types'

const FriendsList = () => {
  const [pendingFriendRequests, setPendingFriendRequests] = useState<
    CombinedFriendDataType[]
  >([])
  useEffect(() => {
    getPendingFriendRequests({ returnUserData: true }).then(res => {
      setPendingFriendRequests(res)
    })
  }, [])

  return (
    <div className='friends-container'>
      <div className='pending-friend-request-list'>
        {pendingFriendRequests.map(req => {
          const { displayName, photoUrl, username } = req
          console.log(displayName, photoUrl, username)
          return (
            <div className='friend-request'>
              <div className='profile-picture-container'>
                <img src={photoUrl} alt={req.displayName} />
              </div>
              <div className='display-name'>{displayName}</div>
              <div className='username'>@{username}</div>
              <button className='accept-request-btn btn-no-styles'>
                Accept
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FriendsList
