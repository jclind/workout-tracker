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
  where,
} from 'firebase/firestore'
import { UserProfileDataType } from '../types'

export const signupWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
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
  const userProfileDataRef = doc(db, 'userProfileData', username)
  const userDataRes = await getDoc(userProfileDataRef)
  if (!userDataRes.exists()) return null
  return userDataRes.data() as UserProfileDataType
}

export const getUsername = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const usernamesRef = collection(db, 'usernames')
    const q = query(usernamesRef, where('uid', '==', uid))
    const queryRes = await getDocs(q)
    let username: string = ''
    queryRes.forEach(doc => {
      username = doc.id
    })
    return username
  }
}
