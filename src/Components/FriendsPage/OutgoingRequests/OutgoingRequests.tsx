import React, { useEffect, useState } from 'react'
import './OutgoingRequests.scss'
import { CombinedRequestedFriendDataType } from '../../../types'
import { getPendingFriendRequests } from '../../../services/friends'
import UserCard from '../UserCard/UserCard'

const RequestedFriends = () => {
  const [pendingList, setPendingList] = useState<
    CombinedRequestedFriendDataType[] | null
  >(null)

  const handleGetPending = async () => {
    const res = await getPendingFriendRequests()
    console.log(res)
    if (res) {
      setPendingList(res)
    }
  }
  useEffect(() => {
    console.log('test')
    handleGetPending()
  }, [])
  return (
    <div>
      {pendingList &&
        pendingList.map(user => {
          return (
            <UserCard key={user.friendUID} user={user} type={'requested'} />
          )
        })}
    </div>
  )
}

export default RequestedFriends
