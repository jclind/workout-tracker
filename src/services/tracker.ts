import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  CurrentWorkoutType,
  ExerciseDataType,
  ExercisesServerDataType,
  WorkoutDataType,
} from '../types'
import { auth, db } from './firestore'
import { v4 as uuidv4 } from 'uuid'
import { parseExercise } from '../util/parseExercise'

export const addWorkout = async (
  name: string,
  exercises: {
    id: string
    text: string
  }[],
  date = new Date().getTime()
): Promise<WorkoutDataType | undefined> => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const promises: Promise<void>[] = []
      const workoutID = uuidv4()
      const parsedExercises: ExerciseDataType[] = exercises.map(ex => {
        return parseExercise(ex.text, ex.id)
      })

      const userDataRef = doc(db, 'usersData', uid)
      const workoutDocRef = doc(userDataRef, 'workouts', workoutID)
      const exercisesRef = collection(userDataRef, 'exercises')
      const workoutData: WorkoutDataType = {
        name,
        date,
        exercises: parsedExercises,
        id: workoutID,
      }

      await setDoc(workoutDocRef, { ...workoutData })

      parsedExercises.forEach((exercise, idx) => {
        const { id, name } = exercise
        const exercisesRefDoc = doc(exercisesRef, id)
        if (name) {
          promises.push(
            setDoc(exercisesRefDoc, {
              ...exercise,
              name: name.toLowerCase(),
              workoutID,
              workoutDate: date,
              index: idx,
            })
          )
        }
      })
      await Promise.all(promises)

      return workoutData
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const importWorkouts = async (
  workouts: WorkoutDataType[]
): Promise<WorkoutDataType[] | undefined> => {
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
        promises.push(setDoc(workoutsRefDoc, workout))

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
      return workouts
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const searchExercises = async (
  queryText: string
): Promise<ExerciseDataType | undefined> => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const exercisesRef = collection(userDataRef, 'exercises')

    const q = query(
      exercisesRef,
      where('name', '>=', queryText),
      where('name', '<=', queryText + '\uf8ff'),
      orderBy('name'),
      orderBy('workoutDate', 'desc'),
      limit(1)
    )

    const dataArr: ExerciseDataType[] = []
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      dataArr.push(doc.data() as ExerciseDataType)
    })

    return dataArr[0]
  }
}

export const queryAllSingleExercise = async (
  exerciseName: string,
  resultsPerPage = 10,
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const exercisesRef = collection(userDataRef, 'exercises')

    let q
    if (lastDoc) {
      q = query(
        exercisesRef,
        where('name', '==', exerciseName.toLowerCase()),
        orderBy('workoutDate', 'desc'),
        startAfter(lastDoc),
        limit(resultsPerPage)
      )
    } else {
      q = query(
        exercisesRef,
        where('name', '==', exerciseName.toLowerCase()),
        orderBy('workoutDate', 'desc'),
        limit(resultsPerPage)
      )
    }

    const results: ExercisesServerDataType[] = []
    const querySnapshot = await getDocs(q)
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    querySnapshot.forEach(doc => {
      results.push(doc.data() as ExercisesServerDataType)
    })

    return { data: results, lastDoc: newLastDoc }
  }
}

export const getWorkouts = async (
  resultsPerPage = 10,
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)
      const workoutsRef = collection(userDataRef, 'workouts')

      let q
      if (lastDoc) {
        q = query(
          workoutsRef,
          startAfter(lastDoc),
          orderBy('date', 'desc'),
          limit(resultsPerPage)
        )
      } else {
        q = query(workoutsRef, orderBy('date', 'desc'), limit(resultsPerPage))
      }

      const querySnapshot = await getDocs(q)
      const workouts: WorkoutDataType[] = []
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      querySnapshot.forEach(doc => {
        const data = doc.data() as WorkoutDataType
        workouts.push(data)
      })

      return { data: workouts, lastDoc: newLastDoc }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const updateExercise = async (
  exerciseID: string,
  workoutID: string,
  exerciseList: ExerciseDataType[],
  updatedExerciseData: ExerciseDataType
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)
      const workoutDocRef = doc(userDataRef, 'workouts', workoutID)
      const exerciseDocRef = doc(userDataRef, 'exercises', exerciseID)

      const updatedExerciseList = exerciseList.map(ex => {
        if (ex.id === exerciseID) return updatedExerciseData
        return ex
      })

      await updateDoc(workoutDocRef, {
        exercises: updatedExerciseList,
      })

      await updateDoc(exerciseDocRef, {
        name: updatedExerciseData.name,
        weights: updatedExerciseData.weights,
        originalString: updatedExerciseData.originalString,
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const getCurrentWorkoutData = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)

      const result = await getDoc(userDataRef)
      const data = result.data()?.currentWorkout as CurrentWorkoutType
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const updateCurrentWorkout = async (
  workoutTitle: string,
  exercises: { id: string; text: string }[]
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)

      const currWorkoutData = { workoutTitle, exercises }

      await updateDoc(userDataRef, { currentWorkout: currWorkoutData })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const deleteWorkout = async (workoutID: string) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)
      const workoutDocRef = doc(userDataRef, 'workouts', workoutID)
      const exercisesRef = collection(userDataRef, 'exercises')

      await deleteDoc(workoutDocRef)

      const q = query(exercisesRef, where('workoutID', '==', workoutID))
      const exercisesQuerySnapshot = await getDocs(q)

      exercisesQuerySnapshot.forEach(doc => {
        deleteDoc(doc.ref)
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

//8080de8f-c12c-414f-8438-9665e9e222f7 smith bench
//2daf1b2a-04c1-4914-a117-1cd0e06462db incline dumbbell bench

export const modifyData = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const workoutsRef = collection(userDataRef, 'workouts')
    const exercisesRef = collection(userDataRef, 'exercises')

    const exercisesQ = query(exercisesRef)

    const exercisesQuerySnapshot = await getDocs(exercisesQ)

    exercisesQuerySnapshot.forEach(doc => {
      deleteDoc(doc.ref)
    })

    const workoutsQ = query(workoutsRef)

    const workoutsQuerySnapshot = await getDocs(workoutsQ)

    workoutsQuerySnapshot.forEach(doc => {
      deleteDoc(doc.ref)
    })
  }
}
