import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth, db } from './firestore'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { UserProfileDataType } from '../types'
import { PUMP_TRACK_LS_USERNAME } from './PUMP_TRACK_LS'

export const signupWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const user = cred.user

  if (user.metadata.creationTime === user.metadata.lastSignInTime) {
    const { displayName, email, photoURL: photoUrl, uid } = user
    const createdAt = user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : new Date().getTime()
    const name = displayName || email?.split('@')[0] || ''
    const username = generateUsername(name, createdAt.toString())
    await addUsername(uid, username)

    const userProfileData: UserProfileDataType = {
      createdAt: Number(createdAt),
      displayName: displayName || '',
      photoUrl: photoUrl || '',
      username,
      totalWorkouts: 0,
      totalExercises: 0,
      lastActive: Number(createdAt),
    }
    const userProfileDocRef = doc(db, 'userProfileData', uid)
    await setDoc(userProfileDocRef, userProfileData)
  }
}
export const logout = async () => {
  await signOut(auth)
}
export const addUsername = async (uid: string, username: string) => {
  const usernameDocRef = doc(db, 'usernames', username)
  if (await checkUsernameExists(username)) {
    return false
  }
  await setDoc(usernameDocRef, { uid })
}
export const checkUsernameExists = async (username: string) => {
  const usernameDocRef = doc(db, 'usernames', username)
  const currUsernameRes = await getDoc(usernameDocRef)
  if (currUsernameRes.exists()) {
    return true
  }
  return false
}
export const updateUsername = async (uid: string, username: string) => {
  const usernameCollectionRef = collection(db, 'usernames')
  const q = query(usernameCollectionRef, where('uid', '==', uid))
  const queryRes = await getDocs(q)
  queryRes.forEach(doc => {
    deleteDoc(doc.ref)
  })
  await setDoc(doc(usernameCollectionRef, username), { uid })
}

export const getUserData = async (
  username: string
): Promise<UserProfileDataType | null> => {
  const uid = await getUIDFromUsername(username)
  const userProfileDataRef = doc(db, 'userProfileData', uid)
  const userDataRes = await getDoc(userProfileDataRef)
  if (!userDataRes.exists()) return null
  return userDataRes.data() as UserProfileDataType
}
const generateUsername = (name: string, createdAt: string) => {
  return name.trim().split(' ').join('').toLowerCase() + createdAt.slice(-7)
}
export const getUsername = async (): Promise<string | undefined> => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const localStorageData = localStorage.getItem(PUMP_TRACK_LS_USERNAME) || ''
    const localStorageUsername = localStorageData
      ? JSON.parse(localStorageData)[uid]
      : null
    if (localStorageUsername) {
      return localStorageUsername
    }
    const usernamesRef = collection(db, 'usernames')
    const q = query(usernamesRef, where('uid', '==', uid))
    const queryRes = await getDocs(q)
    let username: string = ''
    queryRes.forEach(doc => {
      username = doc.id
    })
    localStorage.setItem(
      PUMP_TRACK_LS_USERNAME,
      JSON.stringify({ uid: username })
    )
    return username
  }
}
export const getUIDFromUsername = async (username: string) => {
  const usernamesRef = doc(db, 'usernames', username)
  const usernameRes = await getDoc(usernamesRef)
  if (!usernameRes.exists()) return null
  return usernameRes.data().uid ?? null
}

export const updateUserActivity = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userProfileDocRef = doc(db, 'userProfileData', uid)
    await updateDoc(userProfileDocRef, {
      lastActive: new Date().getTime(),
    })
  }
}

// export const changeUIDs = async () => {
//   const uid = auth?.currentUser?.uid
//   const currUsername = await getUsername()
//   if (uid && currUsername) {
//     const profilesRef = collection(db, 'userProfileData')
//     const docsSnapshot = await getDocs(profilesRef)
//     const dataArr: UserProfileDataType[] = []
//     docsSnapshot.forEach(doc => {
//       dataArr.push(doc.data() as UserProfileDataType)
//       deleteDoc(doc.ref)
//     })
//     await Promise.all(
//       dataArr.map(async user => {
//         const username = user.username
//         const uid = await getUIDFromUsername(username)

//         const newDoc = doc(profilesRef, uid)
//         await setDoc(newDoc, user)
//       })
//     )
//   }
// }
