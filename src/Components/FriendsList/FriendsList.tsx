import React, { useState, useEffect } from 'react'
import './FriendsList.scss'
import {
  acceptFriendRequest,
  getPendingFriendRequests,
} from '../../services/friends'
import { CombinedFriendDataType, UserFriendsListArrType } from '../../types'
import toast from 'react-hot-toast'

type PendingFriendRequestProps = {
  request: CombinedFriendDataType
}

const PendingFriendRequest = ({ request }: PendingFriendRequestProps) => {
  const [accepted, setAccepted] = useState(false)

  const { displayName, photoUrl, username } = request

  const handleAcceptRequest = () => {
    setAccepted(true)
    acceptFriendRequest(username).catch((err: any) => {
      toast.error(err, { position: 'bottom-center' })
      setAccepted(false)
    })
  }
  return (
    <div className='friend-request'>
      <div className='profile-picture-container'>
        <img src={photoUrl} alt={displayName} />
      </div>
      <div className='display-name'>{displayName}</div>
      <div className='username'>@{username}</div>
      <button
        className={`accept-request-btn btn-no-styles ${
          accepted ? 'accepted' : ''
        }`}
        disabled={accepted}
        onClick={handleAcceptRequest}
      >
        {accepted ? 'Accepted' : 'Accept'}
      </button>
    </div>
  )
}

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
          return <PendingFriendRequest request={req} />
        })}
      </div>
    </div>
  )
}

export default FriendsList
