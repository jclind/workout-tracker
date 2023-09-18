import React, { useEffect, useState } from 'react'
import './IncomingRequests.scss'
import { CombinedRequestedFriendDataType } from '../../../types'
import { getIncomingFriendRequests } from '../../../services/friends'
import UserCard from '../UserCard/UserCard'
import { AiOutlineMail } from 'react-icons/ai'
import NoDataAnimation from '../../NoDataAnimation/NoDataAnimation'

const PendingFriendRequests = () => {
  const [incomingList, setIncomingList] = useState<
    CombinedRequestedFriendDataType[] | null
  >(null)
  const [loading, setLoading] = useState(true)

  const [isData, setIsData] = useState(true)

  const handleGetPending = async () => {
    setLoading(true)
    const res = await getIncomingFriendRequests()
    console.log(res)
    if (res && res.length > 0) {
      setIncomingList(res)
    } else {
      setIsData(false)
    }
    setLoading(false)
  }
  useEffect(() => {
    handleGetPending()
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
              <UserCard user={null} type='requested' loading={true} />
              <UserCard user={null} type='requested' loading={true} />
              <UserCard user={null} type='requested' loading={true} />
            </>
          )}
          {incomingList &&
            incomingList.map(user => {
              return (
                <UserCard key={user.friendUID} user={user} type='requested' />
              )
            })}
        </div>
      )}
    </div>
  )
}

export default PendingFriendRequests
