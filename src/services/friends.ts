import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore'
import { getUIDFromUsername, getUsername } from './auth'
import { auth, db, firebaseFunctions } from './firestore'
import {
  CombinedFriendsDataType,
  CombinedRequestedFriendDataType,
  FriendsData,
  UserProfileDataType,
} from '../types'
import { toast } from 'react-hot-toast'
import { httpsCallable } from 'firebase/functions'

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
export const addFriend = async (friendUsername: string) => {
  const uid = auth?.currentUser?.uid
  const currUsername = await getUsername()
  const friendUID: string = await getUIDFromUsername(friendUsername)
  if (uid && friendUID && currUsername) {
    try {
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
export const removeFriend = async (friendUID: string) => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const cloudRemoveFriend = httpsCallable(firebaseFunctions, 'removeFriend')
      await cloudRemoveFriend({ currUID: uid, friendUID })
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
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
      cloudAcceptFriendRequest({
        currUID,
        currUsername,
        friendUID,
        friendUsername,
      }).then(() => {
        const sendFriendAcceptedEmail = httpsCallable(
          firebaseFunctions,
          'sendFriendRequestEmail'
        )
        sendFriendAcceptedEmail({ currUID, friendUID, currUsername })
      })
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
export const getFriends = async <B extends boolean | undefined>(
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null,
  options?: {
    returnUserData?: B
  }
): Promise<
  B extends true
    ? {
        friendsData: CombinedFriendsDataType[]
        lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
      }
    : {
        friendsData: FriendsData[]
        lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
      }
> => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const userProfileRef = doc(db, 'userProfileData', uid)
      const userFriendsRef = collection(userProfileRef, 'friends')

      let q = query(userFriendsRef, orderBy('dateFriended', 'desc'), limit(20))
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }
      const userFriendsSnapshot = await getDocs(q)

      const friends: FriendsData[] = []
      const newLastDoc =
        userFriendsSnapshot.docs[userFriendsSnapshot.docs.length - 1]
      userFriendsSnapshot.forEach(doc => {
        friends.push(doc.data() as FriendsData)
      })

      if (options?.returnUserData) {
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
        const returnData = {
          friendsData: combinedUserData,
          lastDoc: newLastDoc,
        }
        return returnData
      } else {
        const returnData = { friendsData: friends as any, lastDoc: newLastDoc }
        return returnData
      }
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }

  return { friendsData: [], lastDoc: null }
}
export const getNumberOfFriends = async (username: string | null = null) => {
  try {
    const uid = username
      ? await getUIDFromUsername(username)
      : auth?.currentUser?.uid
    if (uid) {
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
export const getIncomingFriendRequests = async () => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const cloudGetIncomingFriendRequests = httpsCallable(
        firebaseFunctions,
        'getIncomingFriendRequests'
      )
      const result: any = await cloudGetIncomingFriendRequests({ uid })

      return result.data as CombinedRequestedFriendDataType[]
      // const userProfileDataRef = doc(db, 'userProfileData', uid)
      // const requestedCollection = collection(userProfileDataRef, 'requested')

      // const q = query(
      //   requestedCollection,
      //   orderBy('dateRequested', 'desc'),
      //   limit(20)
      // )

      // const requestedSnapshot = await getDocs(q)

      // const incomingRequestsData: CombinedRequestedFriendDataType[] = []
      // for (const doc of requestedSnapshot.docs) {
      //   const requestData = doc.data() as RequestedFriendData

      //   const pendingProfileDataRef = doc(db, 'userProfileData', requestData.requestedUsername)

      //   const userProfileDataRes = await getDoc(userProfileDataRef)
      //   const userData = userProfileDataRes.data() as UserProfileDataType

      //   const combined: CombinedRequestedFriendDataType = {
      //     ...requestData,
      //     ...userData,
      //   }
      //   incomingRequestsData.push(combined)
      // }
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const getNumRequested = async () => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const userProfileDataRef = doc(db, 'userProfileData', uid)
      const requestedCollection = collection(userProfileDataRef, 'requested')
      const totalResultsSnapshot = await getCountFromServer(requestedCollection)
      const totalResults = totalResultsSnapshot.data().count
      return totalResults
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
