import React, { useState, useEffect } from 'react'
import './FriendsList.scss'
import { getPendingFriendRequests } from '../../services/friends'
import { UserFriendsListArrType } from '../../types'

const FriendsList = () => {
  const [pendingFriendRequests, setPendingFriendRequests] = useState<
    UserFriendsListArrType[]
  >([])
  useEffect(() => {
    getPendingFriendRequests().then(res => {
      console.log(res)
      setPendingFriendRequests(res)
    })
  }, [])

  return (
    <div className='friends-container'>
      <div className='pending-friend-request-list'>
        {pendingFriendRequests.map(req => {
          return <div className="friend-request">
            <div className="profile-picture-container">
              <img src={req.} alt="" />
            </div>
          </div>
        })}
      </div>
    </div>
  )
}

export default FriendsList
