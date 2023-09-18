import React, { useEffect, useState } from 'react'
import './FriendsList.scss'
import { getFriends } from '../../../services/friends'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { CombinedFriendsDataType } from '../../../types'
import UserCard from '../UserCard/UserCard'

const FriendsList = () => {
  const [friends, setFriends] = useState<CombinedFriendsDataType[] | null>(null)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)

  const handleGetFriends = async (
    currLastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
  ) => {
    const res = await getFriends(currLastDoc, { returnUserData: true })
    setLastDoc(res.lastDoc)
    setFriends(res.friendsData)
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
        <>
          {friends &&
            friends.map(user => {
              return (
                <UserCard
                  key={user.friendUID}
                  user={user}
                  type='friend'
                  removeFromList={removeFriendFromList}
                />
              )
            })}
        </>
      </div>
    </div>
  )
}

export default FriendsList
