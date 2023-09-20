import React, { useEffect, useState } from 'react'
import './OutgoingRequests.scss'
import { CombinedFriendsData } from '../../../types'
import UserCard from '../UserCard/UserCard'
import { getOutgoingFriendRequests } from '../../../services/friends'

const OutgoingRequests = () => {
  const [outgoingList, setOutgoingList] = useState<
    CombinedFriendsData[] | null
  >(null)
  const [loading, setLoading] = useState(true)

  const handleGetOutgoingFriendRequests = async () => {
    setLoading(true)
    const res = await getOutgoingFriendRequests()
    if (res) {
      setOutgoingList(res)
    }
    setLoading(false)
  }

  useEffect(() => {
    handleGetOutgoingFriendRequests()
  }, [])
  return (
    <div className='outgoing-requests-page'>
      <div className='list'>
        {!loading && outgoingList ? (
          outgoingList.map(user => {
            return (
              <UserCard key={user.friendUID} user={user} type={'outgoing'} />
            )
          })
        ) : (
          <>
            <UserCard user={null} type='outgoing' loading={true} />
            <UserCard user={null} type='outgoing' loading={true} />
            <UserCard user={null} type='outgoing' loading={true} />
          </>
        )}
      </div>
    </div>
  )
}

export default OutgoingRequests
