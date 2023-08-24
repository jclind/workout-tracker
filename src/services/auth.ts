import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth, db } from './firestore'
import {
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
import toast from 'react-hot-toast'

export const signupWithGoogle = async () => {
  try {
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
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const addUsername = async (uid: string, username: string) => {
  try {
    const usernameDocRef = doc(db, 'usernames', username)
    if (await checkUsernameExists(username)) {
      return false
    }
    await setDoc(usernameDocRef, { uid })
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const checkUsernameExists = async (username: string) => {
  try {
    const usernameDocRef = doc(db, 'usernames', username)
    const currUsernameRes = await getDoc(usernameDocRef)
    if (currUsernameRes.exists()) {
      return true
    }
    return false
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const updateUsername = async (uid: string, username: string) => {
  try {
    const usernameCollectionRef = collection(db, 'usernames')
    const q = query(usernameCollectionRef, where('uid', '==', uid))
    const queryRes = await getDocs(q)
    queryRes.forEach(doc => {
      deleteDoc(doc.ref)
    })
    await setDoc(doc(usernameCollectionRef, username), { uid })
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}

export const getUserData = async (
  username: string
): Promise<UserProfileDataType | null> => {
  try {
    const uid = await getUIDFromUsername(username)
    const userProfileDataRef = doc(db, 'userProfileData', uid)
    const userDataRes = await getDoc(userProfileDataRef)
    if (!userDataRes.exists()) return null
    return userDataRes.data() as UserProfileDataType
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
    return null
  }
}
const generateUsername = (name: string, createdAt: string) => {
  return name.trim().split(' ').join('').toLowerCase() + createdAt.slice(-7)
}
export const getUsername = async (): Promise<string | undefined> => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const localStorageData =
        localStorage.getItem(PUMP_TRACK_LS_USERNAME) || ''
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
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}
export const getUIDFromUsername = async (username: string) => {
  try {
    const usernamesRef = doc(db, 'usernames', username)
    const usernameRes = await getDoc(usernamesRef)
    if (!usernameRes.exists()) return null
    return usernameRes.data().uid ?? null
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
  }
}

export const updateUserActivity = async () => {
  try {
    const uid = auth?.currentUser?.uid
    if (uid) {
      const userProfileDocRef = doc(db, 'userProfileData', uid)
      await updateDoc(userProfileDocRef, {
        lastActive: new Date().getTime(),
      })
    }
  } catch (error: any) {
    const message = error.message || error
    console.log(error)
    toast.error(message, { position: 'bottom-center' })
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
