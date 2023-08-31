import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
} from 'firebase/firestore'
import { getUIDFromUsername, getUsername } from './auth'
import { auth, db, firebaseFunctions } from './firestore'
import {
  CombinedFriendsDataType,
  CombinedRequestedFriendDataType,
  FriendsData,
  FriendsStatusType,
  PendingFriendData,
  RequestedFriendData,
  UserProfileDataType,
} from '../types'
import { toast } from 'react-hot-toast'
import { httpsCallable } from 'firebase/functions'

export const getRecommendedFriendsList = () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
  }
}

export const getFriendshipStatus = async (friendUID: string | null = null) => {
  const currUID = auth?.currentUser?.uid

  if (currUID && friendUID) {
    const cloudGetFriendshipStatus = httpsCallable(
      firebaseFunctions,
      'getFriendshipStatus'
    )
    const status: any = await cloudGetFriendshipStatus({ currUID, friendUID })

    if (['friends', 'pending', 'requested', 'not_friends'].includes(status)) {
      return status
    }
    return undefined
  }
}

export const checkIfFriends = async (
  friendUsername: string | null = null,
  friendUIDInput: string | null = null
): Promise<FriendsStatusType | undefined> => {
  const currUsername = await getUsername()
  const uid = auth?.currentUser?.uid
  const friendUID = friendUIDInput
    ? friendUIDInput
    : friendUsername
    ? await getUIDFromUsername(friendUsername)
    : null
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
      const message = error.message || error
      console.log(error)
      toast.error(message, { position: 'bottom-center' })
    }
  }
}

export const addFriend = async (friendUsername: string) => {
  const uid = auth?.currentUser?.uid
  const currUsername = await getUsername()
  const friendUID: string = await getUIDFromUsername(friendUsername)
  if (uid && friendUID && currUsername) {
    try {
      // const date = new Date().getTime()
      // const currUserProfileRef = doc(db, 'userProfileData', uid)
      // const currUserRequestedRef = doc(currUserProfileRef, 'pending', friendUID)
      // const pendingData: PendingFriendData = {
      //   friendUID: friendUID,
      //   pendingUsername: friendUsername,
      //   datePending: date,
      // }
      // await setDoc(currUserRequestedRef, pendingData)
      // const friendProfileRef = doc(db, 'userProfileData', friendUID)
      // const friendPendingRequestRef = doc(friendProfileRef, 'requested', uid)
      // const requestedData: RequestedFriendData = {
      //   friendUID: uid,
      //   requestedUsername: currUsername,
      //   dateRequested: date,
      // }
      // await setDoc(friendPendingRequestRef, requestedData)
      const cloudAddFriend = httpsCallable(firebaseFunctions, 'addFriend')
      await cloudAddFriend({
        currUID: uid,
        friendUID,
        currUsername,
        friendUsername,
      })
      const sendFriendMail = httpsCallable(
        firebaseFunctions,
        'sendFriendRequestEmail'
      )
      sendFriendMail({ currUID: uid, friendUID, currUsername })
    } catch (error: any) {
      const message = error.message || error
      console.log(error)
      toast.error(message, { position: 'bottom-center' })
    }
  }
}

export const acceptFriendRequest = async (friendUsername: string) => {
  const currUID = auth?.currentUser?.uid
  const currUsername = await getUsername()
  const friendUID = await getUIDFromUsername(friendUsername)

  if (currUID && friendUID && currUsername) {
    try {
      const cloudAcceptFriendRequest = httpsCallable(
        firebaseFunctions,
        'acceptFriendRequest'
      )
      cloudAcceptFriendRequest({ currUID, friendUID, friendUsername }).then(
        () => {
          const sendFriendAcceptedEmail = httpsCallable(
            firebaseFunctions,
            'sendFriendRequestEmail'
          )
          sendFriendAcceptedEmail({ currUID, friendUID, currUsername })
        }
      )

      // const currUserProfileRef = doc(db, 'userProfileData', uid)
      // const currUserRequestedRef = doc(
      //   currUserProfileRef,
      //   'requested',
      //   friendUID
      // )
      // const currUserRequestedSnapshot = await getDoc(currUserRequestedRef)

      // const friendProfileRef = doc(db, 'userProfileData', friendUID)
      // const friendPendingRef = doc(friendProfileRef, 'pending', uid)
      // const friendPendingSnapshot = await getDoc(friendPendingRef)
      // if (
      //   currUserRequestedSnapshot.exists() &&
      //   friendPendingSnapshot.exists()
      // ) {
      //   const date = new Date().getTime()
      //   const currUserFriendsRef = doc(currUserProfileRef, 'friends', friendUID)
      //   const currUserFriendData: FriendsData = {
      //     friendUID: friendUID,
      //     friendUsername: friendUsername,
      //     dateFriended: date,
      //   }
      //   await setDoc(currUserFriendsRef, currUserFriendData)

      //   const friendFriendsRef = doc(friendProfileRef, 'friends', uid)
      //   const friendFriendData: FriendsData = {
      //     friendUID: uid,
      //     friendUsername: currUsername,
      //     dateFriended: date,
      //   }
      //   await setDoc(friendFriendsRef, friendFriendData)

      //   await deleteDoc(currUserRequestedRef)
      //   await deleteDoc(friendPendingRef)

      //   const sendFriendMail = httpsCallable(
      //     firebaseFunctions,
      //     'sendFriendAcceptedEmail'
      //   )
      //   sendFriendMail({ currUID: uid, friendUID, currUsername })
      // } else {
      //   throw new Error(
      //     'Friendship does not exist, please refresh and try again'
      //   )
      // }
    } catch (error: any) {
      const message = error.message || error
      console.log(error)
      toast.error(message, { position: 'bottom-center' })
    }
  }
}
export const removePendingRequest = async (friendUsername: string) => {
  try {
    const uid = auth?.currentUser?.uid
    const friendUID = await getUIDFromUsername(friendUsername)
    if (uid && friendUID) {
      const cloudRemovePendingRequest = httpsCallable(
        firebaseFunctions,
        'removePendingRequest'
      )
      await cloudRemovePendingRequest({ currUID: uid, friendUID })
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}

// export const getFriendRequests = async <
//   B extends boolean | undefined
// >(options: {
//   returnUserData?: B
// }): Promise<
//   B extends true ? CombinedRequestedFriendDataType[] : RequestedFriendData[]
// > => {
//   const uid = auth?.currentUser?.uid
//   if (uid) {
//     try {
//       const userProfileRef = doc(db, 'userProfileData', uid)
//       const userFriendRequestsRef = collection(userProfileRef, 'requested')
//       const q = query(
//         userFriendRequestsRef,
//         orderBy('dateRequested', 'desc'),
//         limit(20)
//       )
//       const querySnapshot = await getDocs(q)
//       const users: RequestedFriendData[] = []
//       querySnapshot.forEach(doc => {
//         users.push(doc.data() as RequestedFriendData)
//       })

//       if (options.returnUserData) {
//         const userProfileDataRef = collection(db, 'userProfileData')
//         const combinedUserData: CombinedRequestedFriendDataType[] =
//           await Promise.all(
//             users.map(
//               async (
//                 user: RequestedFriendData
//               ): Promise<CombinedRequestedFriendDataType> => {
//                 const friendUID = user.friendUID
//                 const userProfileDataDocRef = doc(userProfileDataRef, friendUID)
//                 const userProfileDataSnapshot = await getDoc(
//                   userProfileDataDocRef
//                 )
//                 const userProfileData =
//                   userProfileDataSnapshot.data() as UserProfileDataType
//                 const result: CombinedRequestedFriendDataType = {
//                   ...user,
//                   ...userProfileData,
//                 }
//                 return result
//               }
//             )
//           )
//         return combinedUserData
//       } else {
//         return users as any
//       }
//     } catch (error: any) {
//       const message = error.message || error
//       console.log(error)
//       toast.error(message, { position: 'bottom-center' })
//     }
//   }
//   return []
// }

export const getFriends = async <B extends boolean | undefined>(options: {
  returnUserData?: B
}): Promise<B extends true ? CombinedFriendsDataType[] : FriendsData[]> => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const userProfileRef = doc(db, 'userProfileData', uid)
      const userFriendsRef = collection(userProfileRef, 'friends')
      const q = query(
        userFriendsRef,
        orderBy('dateFriended', 'desc'),
        limit(20)
      )
      const userFriendsSnapshot = await getDocs(q)

      const friends: FriendsData[] = []
      userFriendsSnapshot.forEach(doc => {
        friends.push(doc.data() as FriendsData)
      })

      if (options.returnUserData) {
        const userProfileDataRef = collection(db, 'userProfileData')
        const combinedUserData: CombinedFriendsDataType[] = await Promise.all(
          friends.map(
            async (friend: FriendsData): Promise<CombinedFriendsDataType> => {
              const friendUID = friend.friendUID
              const userProfileDataDocRef = doc(userProfileDataRef, friendUID)
              const userProfileDataSnapshot = await getDoc(
                userProfileDataDocRef
              )
              const userProfileData =
                userProfileDataSnapshot.data() as UserProfileDataType
              const result: CombinedFriendsDataType = {
                ...friend,
                ...userProfileData,
              }
              return result
            }
          )
        )
        return combinedUserData
      } else {
        return friends as any
      }
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }

  return []
}

export const getNumberOfFriends = async (username: string | null = null) => {
  try {
    const uid = username
      ? await getUIDFromUsername(username)
      : auth?.currentUser?.uid
    if (uid) {
      // const profileRef = doc(db, 'userProfileData', uid)
      // const friendsRef = collection(profileRef, 'friends')
      // const numberOfFriendsRes = await getCountFromServer(friendsRef)
      // const numberOfFriends = numberOfFriendsRes.data().count

      // return numberOfFriends
      const getNumFriends = httpsCallable(
        firebaseFunctions,
        'getNumberOfFriends'
      )
      const numFriendsData = await getNumFriends({ uid })
      return numFriendsData.data as number
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}

export const getSuggestedFriends = async () => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const cloudGetSuggestedFriends = httpsCallable(
        firebaseFunctions,
        'getSuggestedFriends'
      )
      const suggestedFriendsRes = await cloudGetSuggestedFriends({ uid })
      const suggestedFriendsData =
        suggestedFriendsRes.data as UserProfileDataType[]
      return suggestedFriendsData
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}

export const getPendingFriendRequests = async (): Promise<
  CombinedRequestedFriendDataType[] | undefined
> => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const getPendingRequests = httpsCallable(
        firebaseFunctions,
        'getPendingFriendRequests'
      )
      const pendingRequestsRes = await getPendingRequests({ uid })
      const pendingRequestsData =
        pendingRequestsRes.data as CombinedRequestedFriendDataType[]
      if (pendingRequestsData) {
        return pendingRequestsData
      }
      return undefined
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
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
