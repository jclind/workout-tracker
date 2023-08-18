import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { getUIDFromUsername, getUsername } from './auth'
import { auth, db } from './firestore'
import {
  CombinedFriendDataType,
  FriendsData,
  FriendsStatusType,
  PendingFriendData,
  RequestedFriendData,
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
  const uid = auth?.currentUser?.uid
  const friendUID = await getUIDFromUsername(friendUsername)
  if (uid && friendUID && currUsername) {
    try {
      const currUserProfileRef = doc(db, 'userProfileData', uid)
      const currUserFriendsRef = doc(currUserProfileRef, 'friends', friendUID)
      const currUserFriendsSnapshot = await getDoc(currUserFriendsRef)
      if (currUserFriendsSnapshot.exists()) {
        return 'friends'
      }
      const currUserPendingRef = doc(currUserProfileRef, 'pending', friendUID)
      const currUserPendingSnapshot = await getDoc(currUserPendingRef)
      if (currUserPendingSnapshot.exists()) {
        return 'pending'
      }

      const currUserRequestedRef = doc(
        currUserProfileRef,
        'requested',
        friendUID
      )
      const currUserRequestedSnapshot = await getDoc(currUserRequestedRef)
      if (currUserRequestedSnapshot.exists()) {
        return 'requested'
      }

      return 'not_friends'
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const addFriend = async (friendUsername: string) => {
  const uid = auth?.currentUser?.uid
  const currUsername = await getUsername()
  const friendUID = await getUIDFromUsername(friendUsername)
  if (uid && friendUID && currUsername) {
    const date = new Date().getTime()

    const currUserProfileRef = doc(db, 'userProfileData', uid)
    const currUserRequestedRef = doc(currUserProfileRef, 'pending', friendUID)
    const pendingData: PendingFriendData = {
      friendUID: friendUID,
      pendingUsername: friendUsername,
      datePending: date,
    }
    await setDoc(currUserRequestedRef, pendingData)

    const friendProfileRef = doc(db, 'userProfileData', friendUID)
    const friendPendingRequestRef = doc(friendProfileRef, 'requested', uid)
    const requestedData: RequestedFriendData = {
      friendUID: uid,
      requestedUsername: currUsername,
      dateRequested: date,
    }
    await setDoc(friendPendingRequestRef, requestedData)
  }
}

export const acceptFriendRequest = async (friendUsername: string) => {
  const uid = auth?.currentUser?.uid
  const currUsername = await getUsername()
  const friendUID = await getUIDFromUsername(friendUsername)
  if (uid && friendUID && currUsername) {
    try {
      const currUserProfileRef = doc(db, 'userProfileData', uid)
      const currUserPendingRef = doc(currUserProfileRef, 'pending', friendUID)
      const currUserPendingSnapshot = await getDoc(currUserPendingRef)

      const friendProfileRef = doc(db, 'userProfileData', friendUID)
      const friendRequestedRef = doc(friendProfileRef, 'requested', uid)
      const friendRequestedSnapshot = await getDoc(friendRequestedRef)

      if (
        currUserPendingSnapshot.exists() &&
        friendRequestedSnapshot.exists()
      ) {
        const date = new Date().getTime()
        const currUserFriendsRef = doc(currUserProfileRef, 'friends', friendUID)
        const currUserFriendData: FriendsData = {
          friendUID: friendUID,
          friendUsername: friendUsername,
          dateFriended: date,
        }
        await setDoc(currUserFriendsRef, currUserFriendData)

        const friendFriendsRef = doc(friendProfileRef, 'friends', uid)
        const friendFriendData: FriendsData = {
          friendUID: uid,
          friendUsername: currUsername,
          dateFriended: date,
        }
        await setDoc(friendFriendsRef, friendFriendData)

        await deleteDoc(currUserPendingRef)
        await deleteDoc(friendRequestedRef)
      } else {
        throw new Error(
          'Friendship does not exist, please refresh and try again'
        )
      }
    } catch (error: any) {
      throw new Error(error.message || error)
    }
  }
}

export const getFriendRequests = async <
  B extends boolean | undefined
>(options: {
  returnUserData?: B
}): Promise<
  B extends true ? CombinedFriendDataType[] : PendingFriendData[]
> => {
  const uid = auth?.currentUser?.uid
  console.log('here')
  if (uid) {
    console.log('here 2')
    const userProfileRef = doc(db, 'userProfileData', uid)
    const userFriendRequestsRef = collection(userProfileRef, 'requested')
    const q = query(
      userFriendRequestsRef,
      orderBy('dateRequested', 'desc'),
      limit(20)
    )
    const querySnapshot = await getDocs(q)
    const users: PendingFriendData[] = []
    querySnapshot.forEach(doc => {
      users.push(doc.data() as PendingFriendData)
    })
    console.log('here 4', users)

    if (options.returnUserData) {
      const userProfileDataRef = collection(db, 'userProfileData')
      const combinedUserData: CombinedFriendDataType[] = await Promise.all(
        users.map(
          async (user: PendingFriendData): Promise<CombinedFriendDataType> => {
            const username = user.pendingUsername
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
      return users
    }
  }
  return []
}

// export const getPendingFriendRequests = async <
//   B extends boolean | undefined
// >(options: {
//   returnUserData?: B
// }): Promise<
//   B extends true ? CombinedFriendDataType[] : UserFriendsListArrType[]
// > => {
//   const currUsername = await getUsername()
//   const uid: string = currUsername && await getUIDFromUsername(currUsername)
//   if (uid && currUsername) {
//     const userFriendsDocRef = doc(db, 'friends', currUsername)
//     const userFriendsDataRes = await getDoc(userFriendsDocRef)
//     if (!userFriendsDataRes.exists()) {
//       return []
//     }
//     const userFriendsData = userFriendsDataRes.data()
//     const userFriendsArr = Object.keys(userFriendsData).map(k => ({
//       ...userFriendsData[k],
//       username: k,
//     })) as UserFriendsListArrType[]
//     const pendingRequests = userFriendsArr.filter(
//       val => val.status === 'pending'
//     )

//     if (options.returnUserData) {
//       const userProfileDataRef = collection(db, 'userProfileData')
//       const combinedUserData: CombinedFriendDataType[] = await Promise.all(
//         pendingRequests.map(
//           async (
//             user: UserFriendsListArrType
//           ): Promise<CombinedFriendDataType> => {
//             const username = user.username
//             const userProfileDataDocRef = doc(userProfileDataRef, username)
//             const userProfileDataSnapshot = await getDoc(userProfileDataDocRef)
//             const userProfileData =
//               userProfileDataSnapshot.data() as UserProfileDataType
//             const result = {
//               ...user,
//               ...userProfileData,
//             }
//             return result
//           }
//         )
//       )
//       return combinedUserData
//     } else {
//       return pendingRequests as any
//     }
//   }
//   return [] as any
// }

// export const acceptFriendRequest = async (friendUsername: string) => {
//   const currUsername = await getUsername()
//   if (currUsername) {
//     const friendsDataDocRef = doc(db, 'friends', friendUsername)
//     const currUserDataDocRef = doc(db, 'friends', currUsername)

//     await setDoc(
//       friendsDataDocRef,
//       {
//         [currUsername]: 'friends' as FriendsStatusType,
//       },
//       { merge: true }
//     )
//     await setDoc(
//       currUserDataDocRef,
//       {
//         [friendUsername]: 'friends',
//       },
//       { merge: true }
//     )
//   }
// }
