import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getUsername } from './auth'
import { auth, db } from './firestore'
import {
  CombinedFriendDataType,
  FriendsStatusType,
  UserFriendsListArrType,
  UserFriendsListType,
  UserProfileDataType,
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

export const getPendingFriendRequests = async <
  B extends boolean | undefined
>(options: {
  returnUserData?: B
}): Promise<
  B extends true ? CombinedFriendDataType[] : UserFriendsListArrType[]
> => {
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
      const userProfileDataRef = collection(db, 'userProfileData')
      const combinedUserData: CombinedFriendDataType[] = await Promise.all(
        pendingRequests.map(
          async (
            user: UserFriendsListArrType
          ): Promise<CombinedFriendDataType> => {
            const username = user.username
            const userProfileDataDocRef = doc(userProfileDataRef, username)
            const userProfileDataSnapshot = await getDoc(userProfileDataDocRef)
            const userProfileData =
              userProfileDataSnapshot.data() as UserProfileDataType
            const result = {
              ...user,
              ...userProfileData,
            }
            return result
          }
        )
      )
      return combinedUserData
    } else {
      return pendingRequests as any
    }
  }
  return [] as any
}

export const acceptFriendRequest = async (friendUsername: string) => {
  const currUsername = await getUsername()
  if (currUsername) {
    const friendsDataDocRef = doc(db, 'friends', friendUsername)
    const currUserDataDocRef = doc(db, 'friends', currUsername)

    await setDoc(
      friendsDataDocRef,
      {
        [currUsername]: 'friends' as FriendsStatusType,
      },
      { merge: true }
    )
    await setDoc(
      currUserDataDocRef,
      {
        [friendUsername]: 'friends',
      },
      { merge: true }
    )
  }
}
