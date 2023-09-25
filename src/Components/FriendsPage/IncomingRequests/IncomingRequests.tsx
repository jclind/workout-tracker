import React, { useEffect, useState } from 'react'
import './IncomingRequests.scss'
import { getIncomingFriendRequests } from '../../../services/friends'
import UserCard from '../UserCard/UserCard'
import NoDataAnimation from '../../NoDataAnimation/NoDataAnimation'
import { CombinedFriendsData } from '../../../types'
import { useFriendsContext } from '../../../Pages/Friends/Friends'

const IncomingFriendRequests = () => {
  const [incomingList, setIncomingList] = useState<
    CombinedFriendsData[] | null
  >(null)
  const [loading, setLoading] = useState(true)

  const [isData, setIsData] = useState(true)

  const { setNumIncoming, setNumFriends } = useFriendsContext()

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

  const removeFromList = async (uid: string) => {
    setIncomingList(prev => {
      if (prev) {
        return prev.filter(val => val.friendUID !== uid)
      }
      return []
    })
  }

  return (
    <div className='incoming-requests-page'>
      {!isData ? (
        <div className='friends-no-data'>
          <NoDataAnimation />

          <div className='no-data-title'>No Friend Requests</div>
          <p>
            All future friend requests will show up here so make sure to check
            back in the future.
          </p>
        </div>
      ) : (
        <div className='friends-list'>
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
                <UserCard
                  key={user.friendUID}
                  user={user}
                  type='incoming'
                  removeFromList={removeFromList}
                  setNumIncoming={setNumIncoming}
                  setNumFriends={setNumFriends}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}

export default IncomingFriendRequests
