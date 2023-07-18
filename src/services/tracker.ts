import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { WorkoutDataType } from '../types'
import { auth, db } from './firestore'

export const importWorkouts = async (workouts: WorkoutDataType[]) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const promises: Promise<void>[] = []

      const userDataRef = doc(db, 'usersData', uid)
      const workoutsRef = collection(userDataRef, 'workouts')
      const exercisesRef = collection(userDataRef, 'exercises')

      workouts.forEach(workout => {
        const workoutID = workout.id
        const workoutDate = workout.date

        const workoutsRefDoc = doc(workoutsRef, workoutID)
        promises.push(setDoc(workoutsRefDoc, { workout }))

        workout.exercises.forEach((exercise, idx) => {
          const { id, name } = exercise
          const exercisesRefDoc = doc(exercisesRef, id)
          if (name) {
            promises.push(
              setDoc(exercisesRefDoc, {
                ...exercise,
                name: name.toLowerCase(),
                workoutID,
                workoutDate,
                index: idx,
              })
            )
          }
        })
      })
      await Promise.all(promises)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const searchExercises = async (queryText: string) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const exercisesRef = collection(userDataRef, 'exercises')

    const q = query(
      exercisesRef,
      where('name', '>=', queryText),
      where('name', '<=', queryText + '\uf8ff'),
      limit(1)
    )

    let name = ''
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      name = doc.data().name
    })

    return name

    // const names: string[] = []
    // querySnapshot.forEach(doc => {
    //   const data = doc.data()
    //   names.push(data.name)
    // })
    // return names
  }
}
