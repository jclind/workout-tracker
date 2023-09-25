import React, { useEffect, useState } from 'react'
import './OutgoingRequests.scss'
import { CombinedFriendsData } from '../../../types'
import UserCard from '../UserCard/UserCard'
import { getOutgoingFriendRequests } from '../../../services/friends'
import NoDataAnimation from '../../NoDataAnimation/NoDataAnimation'

const OutgoingRequests = () => {
  const [outgoingList, setOutgoingList] = useState<
    CombinedFriendsData[] | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [isData, setIsData] = useState(true)

  const handleGetOutgoingFriendRequests = async () => {
    setLoading(true)
    const res = await getOutgoingFriendRequests()
    if (res) {
      setOutgoingList(res)
    } else {
      setIsData(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    handleGetOutgoingFriendRequests()
  }, [])
  return (
    <div className='outgoing-requests-page'>
      <div className='friends-list'>
        {!isData ? (
          <div className='friends-no-data'>
            <NoDataAnimation />

            <div className='no-data-title'>No Outgoing Requests</div>
            <p>
              All pending friend requests will show up here, check back when
              you've sent a request.
            </p>
          </div>
        ) : !loading && outgoingList ? (
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
