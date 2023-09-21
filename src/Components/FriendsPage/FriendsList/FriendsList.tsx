import React, { useEffect, useState } from 'react'
import './FriendsList.scss'
import { getFriends } from '../../../services/friends'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import UserCard from '../UserCard/UserCard'
import { CombinedFriendsData } from '../../../types'
import NoDataAnimation from '../../NoDataAnimation/NoDataAnimation'
import { TailSpin } from 'react-loader-spinner'

const FriendsList = () => {
  const [friends, setFriends] = useState<CombinedFriendsData[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMoreData, setIsMoreData] = useState(true)
  const [isMoreLoading, setIsMoreLoading] = useState(false)

  const handleGetFriends = async (
    currLastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
  ) => {
    const res = await getFriends(currLastDoc, { returnUserData: true })
    const updatedFriends = [...friends, ...res.friendsData]
    setLastDoc(res.lastDoc)
    setFriends(updatedFriends)
    if (res.numFriends <= updatedFriends.length) {
      setIsMoreData(false)
    }
    console.log(res)
    setLoading(false)
  }

  const handlePaginateFriends = async () => {
    setIsMoreLoading(true)
    handleGetFriends(lastDoc)
  }
  useEffect(() => {
    handleGetFriends(lastDoc)
  }, [])

  const removeFriendFromList = (uid: string) => {
    if (friends) {
      const newFriends = friends?.filter(friend => friend.friendUID !== uid)
      setFriends(newFriends)
    }
  }

  return (
    <div className='friends-list-page'>
      <div className='list'>
        {!isMoreData && friends.length <= 0 ? (
          <div className='friends-no-data'>
            <NoDataAnimation />

            <div className='no-data-title'>No Current Friends</div>
            <p>
              All of your future friends will show up here. Make sure to check
              back later.
            </p>
          </div>
        ) : friends && !loading ? (
          friends.map(user => {
            return (
              <UserCard
                key={user.friendUID}
                user={user}
                type='friend'
                removeFromList={removeFriendFromList}
              />
            )
          })
        ) : (
          <>
            <UserCard user={null} type='friend' loading={true} />
            <UserCard user={null} type='friend' loading={true} />
            <UserCard user={null} type='friend' loading={true} />
          </>
        )}
        {isMoreData && !loading ? (
          <div className='load-more-btn-container'>
            <button
              className='btn-no-styles load-more'
              onClick={handlePaginateFriends}
              disabled={isMoreLoading}
            >
              {isMoreLoading ? (
                <TailSpin
                  height='25'
                  width='25'
                  color='#303841'
                  ariaLabel='loading'
                />
              ) : (
                'Load More'
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default FriendsList
