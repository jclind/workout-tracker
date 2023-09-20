import React, { useEffect, useState } from 'react'
import './IncomingRequests.scss'
import { getIncomingFriendRequests } from '../../../services/friends'
import UserCard from '../UserCard/UserCard'
import NoDataAnimation from '../../NoDataAnimation/NoDataAnimation'
import { CombinedFriendsData } from '../../../types'

const IncomingFriendRequests = () => {
  const [incomingList, setIncomingList] = useState<
    CombinedFriendsData[] | null
  >(null)
  const [loading, setLoading] = useState(true)

  const [isData, setIsData] = useState(true)

  const handleGetIncomingFriendRequests = async () => {
    setLoading(true)
    const res = await getIncomingFriendRequests()
    if (res && res.length > 0) {
      setIncomingList(res)
    } else {
      setIsData(false)
    }
    setLoading(false)
  }
  useEffect(() => {
    handleGetIncomingFriendRequests()
  }, [])
  return (
    <div className='incoming-requests-page'>
      {!isData ? (
        <div className='no-data'>
          <NoDataAnimation />

          <div className='no-data-title'>No Friend Requests</div>
          <p>
            All future friend requests will show up here so make sure to check
            back in the future.
          </p>
        </div>
      ) : (
        <div className='list'>
          {loading && (
            <>
              <UserCard user={null} type='incoming' loading={true} />
              <UserCard user={null} type='incoming' loading={true} />
              <UserCard user={null} type='incoming' loading={true} />
            </>
          )}
          {incomingList &&
            incomingList.map(user => {
              return (
                <UserCard key={user.friendUID} user={user} type='incoming' />
              )
            })}
        </div>
      )}
    </div>
  )
}

export default IncomingFriendRequests
