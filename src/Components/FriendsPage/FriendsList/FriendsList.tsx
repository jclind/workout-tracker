import React, { useEffect, useState } from 'react'
import './FriendsList.scss'
import { getFriends } from '../../../services/friends'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import UserCard from '../UserCard/UserCard'
import { CombinedFriendsData } from '../../../types'

const FriendsList = () => {
  const [friends, setFriends] = useState<CombinedFriendsData[] | null>(null)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)
  const [loading, setLoading] = useState(true)

  const handleGetFriends = async (
    currLastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
  ) => {
    setLoading(true)
    const res = await getFriends(currLastDoc, { returnUserData: true })
    setLastDoc(res.lastDoc)
    setFriends(res.friendsData)
    console.log(res)
    setLoading(false)
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
        {friends && !loading ? (
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
      </div>
    </div>
  )
}

export default FriendsList
