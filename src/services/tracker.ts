import { collection, doc, setDoc } from 'firebase/firestore'
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
