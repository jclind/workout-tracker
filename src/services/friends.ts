import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getUsername } from './auth'
import { auth, db } from './firestore'
import {
  FriendsStatusType,
  UserFriendsListArrType,
  UserFriendsListType,
} from '../types'

export const getRecommendedFriendsList = () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
  }
}

export const checkIfFriends = async (
  friendUsername: string
): Promise<FriendsStatusType | undefined> => {
  const currUsername = await getUsername()
  if (currUsername) {
    const friendsDocRef = doc(db, 'friends', currUsername)
    const friendsRes = await getDoc(friendsDocRef)
    const friendData = friendsRes.data()
    if (!friendData) return undefined
    return friendData[friendUsername].status as FriendsStatusType
  }
}

export const addFriend = async (friendUsername: string) => {
  const currUsername = await getUsername()
  if (currUsername) {
    const friendsDataDocRef = doc(db, 'friends', friendUsername)
    const currUserDataDocRef = doc(db, 'friends', currUsername)
    const dateFriendRequest = new Date().getTime()
    await setDoc(
      friendsDataDocRef,
      {
        [currUsername]: {
          status: 'requested' as FriendsStatusType,
          dateFriendRequest,
        },
      },
      { merge: true }
    )
    await setDoc(
      currUserDataDocRef,
      {
        [friendUsername]: {
          status: 'pending' as FriendsStatusType,
          dateFriendRequest,
        },
      },
      { merge: true }
    )
  }
}

export const getPendingFriendRequests = async (options: {
  returnUserData?: boolean
}) => {
  const currUsername = await getUsername()
  if (currUsername) {
    const userFriendsDocRef = doc(db, 'friends', currUsername)
    const userFriendsDataRes = await getDoc(userFriendsDocRef)
    if (!userFriendsDataRes.exists()) {
      return []
    }
    const userFriendsData = userFriendsDataRes.data()
    const userFriendsArr = Object.keys(userFriendsData).map(k => ({
      ...userFriendsData[k],
      username: k,
    })) as UserFriendsListArrType[]
    const pendingRequests = userFriendsArr.filter(
      val => val.status === 'pending'
    )
    if (options.returnUserData) {
      // const promises: Promise<void>[] = []
      const userProfileDataRef = collection(db, 'userProfileData')
      const promises = pendingRequests.map(user => {
        const username = user.username
        const userProfileDataDocRef = doc(userProfileDataRef, username)
        const userProfileDataSnapshot = await getDoc(userProfileDataDocRef)
        const userProfileData = userProfileDataSnapshot.data()
        return { ...user, userProfileData }
      })

      await Promise.all(promises)
    }
    return pendingRequests
  }
  return []
}
