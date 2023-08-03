import {
  DocumentData,
  QueryDocumentSnapshot,
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
import { getTitleAndDate } from '../util/getTitleAndDate'

export const addWorkout = async (
  name: string,
  exercises: {
    id: string
    text: string
  }[]
): Promise<WorkoutDataType | undefined> => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const promises: Promise<void>[] = []
      const workoutID = uuidv4()
      const parsedExercises: ExerciseDataType[] = exercises.map(ex => {
        return parseExercise(ex.text, ex.id)
      })

      const { title: workoutTitle, date } = getTitleAndDate(name)
      const workoutDate = date || new Date().getTime()

      const userDataRef = doc(db, 'usersData', uid)
      const workoutDocRef = doc(userDataRef, 'workouts', workoutID)
      const exercisesRef = collection(userDataRef, 'exercises')
      await updateUniqueTitles('workoutTitles', workoutTitle)

      const workoutData: WorkoutDataType = {
        name: workoutTitle,
        date: workoutDate,
        exercises: parsedExercises,
        id: workoutID,
      }

      await setDoc(workoutDocRef, { ...workoutData })

      const exerciseTitles: string[] = []

      parsedExercises.forEach((exercise, idx) => {
        const { id, name } = exercise
        const exercisesRefDoc = doc(exercisesRef, id)
        if (name) {
          exerciseTitles.push(name)
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
      await updateUniqueTitles('exerciseTitles', exerciseTitles)
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

      const workoutTitles: string[] = []
      const exerciseTitles: string[] = []

      workouts.forEach(workout => {
        const workoutID = workout.id
        const workoutDate = workout.date
        const workoutData = { ...workout, name: workout.name.toLowerCase() }

        const workoutsRefDoc = doc(workoutsRef, workoutID)

        workoutTitles.push(workoutData.name)

        promises.push(setDoc(workoutsRefDoc, workoutData))

        workout.exercises.forEach((exercise, idx) => {
          const { id, name } = exercise
          const exercisesRefDoc = doc(exercisesRef, id)
          if (name) {
            exerciseTitles.push(name)
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
      await updateUniqueTitles('workoutTitles', workoutTitles)
      await updateUniqueTitles('exerciseTitles', exerciseTitles)
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
export const getUniqueWorkoutTitles = async (): Promise<
  string[] | undefined
> => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)

      const userDataDoc = await getDoc(userDataRef)
      const workoutTitles = userDataDoc.data()?.workoutTitles || null

      if (!workoutTitles) return []

      const sortedTitles = Object.keys(workoutTitles).sort(function (a, b) {
        return workoutTitles[b] - workoutTitles[a]
      })
      return sortedTitles
    } catch (error: any) {
      throw new Error(error.message)
    }
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
    const countQuery = query(
      exercisesRef,
      where('name', '==', exerciseName.toLowerCase())
    )
    const totalResultsSnapshot = await getCountFromServer(countQuery)
    const totalResults = totalResultsSnapshot.data().count

    const results: ExercisesServerDataType[] = []
    const querySnapshot = await getDocs(q)
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    querySnapshot.forEach(doc => {
      results.push(doc.data() as ExercisesServerDataType)
    })

    return { data: results, lastDoc: newLastDoc, totalResults }
  }
}

export const getWorkouts = async (
  resultsPerPage = 10,
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null,
  workoutNameQuery: string | null
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)
      const workoutsRef = collection(userDataRef, 'workouts')

      let q = query(workoutsRef)
      if (workoutNameQuery) {
        q = query(q, where('name', '==', workoutNameQuery))
      }
      q = query(q, orderBy('date', 'desc'), limit(resultsPerPage))
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const totalResultsSnapshot = await getCountFromServer(workoutsRef)
      const totalResults = totalResultsSnapshot.data().count

      const querySnapshot = await getDocs(q)
      const workouts: WorkoutDataType[] = []
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      querySnapshot.forEach(doc => {
        const data = doc.data() as WorkoutDataType
        workouts.push(data)
      })

      return { data: workouts, lastDoc: newLastDoc, totalResults }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}

export const updateExercise = async (
  exerciseID: string,
  workoutID: string,
  exerciseList: ExerciseDataType[],
  updatedExerciseData: ExerciseDataType,
  originalExerciseName: string
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
      await updateUniqueTitles(
        'exerciseTitles',
        updatedExerciseData.name,
        originalExerciseName
      )
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
export const updateWorkout = async (
  currWorkoutData: WorkoutDataType,
  updatedData: { name?: string; date?: number }
) => {
  console.log(updatedData)
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const workoutID = currWorkoutData.id
      const userDataRef = doc(db, 'usersData', uid)
      const workoutDocRef = doc(userDataRef, 'workouts', workoutID)
      await updateDoc(workoutDocRef, {
        ...updatedData,
      })
      if (updatedData.name) {
        const addedTitle = updatedData.name
        const removedTitle = currWorkoutData.name
        await updateUniqueTitles('workoutTitles', addedTitle, removedTitle)
      }
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

      await setDoc(
        userDataRef,
        { currentWorkout: currWorkoutData },
        { merge: true }
      )
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

export const modifyData = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const workoutsRef = collection(userDataRef, 'workouts')
    const exercisesRef = collection(userDataRef, 'exercises')

    const exercisesQ = query(exercisesRef)

    const exercisesQuerySnapshot = await getDocs(exercisesQ)

    exercisesQuerySnapshot.forEach(doc => {
      // deleteDoc(doc.ref)
    })

    const workoutsQ = query(workoutsRef)

    const workoutsQuerySnapshot = await getDocs(workoutsQ)

    workoutsQuerySnapshot.forEach(doc => {
      // deleteDoc(doc.ref)
    })
  }
}

export const updateUniqueTitles = async (
  field: 'workoutTitles' | 'exerciseTitles',
  addedTitles: string | string[] | null,
  removedTitles: string | string[] | null = null
) => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    try {
      const userDataRef = doc(db, 'usersData', uid)
      const userDataDoc = await getDoc(userDataRef)
      const titlesDocData = userDataDoc.data()
      const titles = titlesDocData?.[field] || {}

      if (addedTitles) {
        if (typeof addedTitles === 'string') {
          const title = addedTitles.toLowerCase().trim()
          // Add workout title the workoutTitles object
          titles[title] = ++titles[title] || 1
        } else {
          addedTitles.forEach(title => {
            titles[title] = ++titles[title] || 1
          })
        }
      }
      if (removedTitles) {
        if (typeof removedTitles === 'string') {
          const title = removedTitles.toLowerCase().trim()
          titles[title] = --titles[title] || 0
        } else {
          removedTitles.forEach(title => {
            titles[title] = --titles[title] || 0
          })
        }
      }
      console.log(addedTitles, removedTitles)
      const filteredTitles: { [key: string]: number } = {}
      for (const [key, value] of Object.entries(titles)) {
        if (typeof value === 'number' && value > 0) {
          filteredTitles[key] = value
        }
      }
      console.log(filteredTitles)
      await updateDoc(userDataRef, {
        [field]: filteredTitles,
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
// export const updateUniqueExerciseTitles = async (
//   addedExercises: ExerciseDataType | ExerciseDataType[] | null,
//   removedExercises: ExerciseDataType | ExerciseDataType[] | null = null
// ) => {
//   const uid = auth?.currentUser?.uid
//   if (uid) {
//     try {
//       const userDataRef = doc(db, 'usersData', uid)
//       const userDataDoc = await getDoc(userDataRef)
//       const exerciseTitles = userDataDoc.data()?.exerciseTitles || {}

//       if (addedExercises) {
//         if (Array.isArray(addedExercises)) {
//           addedExercises.forEach(exercise => {
//             const title = exercise.name
//             exerciseTitles[title] = ++exerciseTitles[title] || 1
//           })
//         } else {
//           const title = addedExercises.name
//           exerciseTitles[title] = ++exerciseTitles[title] || 1
//         }
//       }
//       if (removedExercises) {
//         if (Array.isArray(removedExercises)) {
//           removedExercises.forEach(exercise => {
//             const title = exercise.name
//             exerciseTitles[title] = ++exerciseTitles[title] || 1
//           })
//         } else {
//           const title = removedExercises.name
//           exerciseTitles[title] = ++exerciseTitles[title] || 1
//         }
//       }
//       const filteredTitles: { [key: string]: number } = {}
//       for (const [key, value] of Object.entries(exerciseTitles)) {
//         if (typeof value === 'number' && value > 0) {
//           filteredTitles[key] = value
//         }
//       }
//       await updateDoc(userDataRef, {
//         exerciseTitles: filteredTitles,
//       })
//     } catch (error: any) {
//       throw new Error(error.message)
//     }
//   }
// }

export const findUniqueWorkoutTitlesFromCollection = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const workoutsRef = collection(userDataRef, 'workouts')
    const workoutsQ = query(workoutsRef)
    const workoutsQuerySnapshot = await getDocs(workoutsQ)
    const workoutTitles: { [key: string]: number } = {}

    workoutsQuerySnapshot.forEach(doc => {
      const workoutData = doc.data() as WorkoutDataType
      let workoutTitle = workoutData.name.toLowerCase().trim()
      workoutTitles[workoutTitle] = ++workoutTitles[workoutTitle] || 1
      // workoutTitle = workoutTitle.replace('day', '').toLowerCase()
      // if (workoutTitle === 'leg') workoutTitle = 'legs'

      // console.log(workoutData.name, workoutTitle)
      // updateDoc(doc.ref, {
      //   name: workoutTitle,
      // })
    })

    updateDoc(userDataRef, {
      workoutTitles,
    })
  }
}
export const findUniqueExerciseTitlesFromCollection = async () => {
  const uid = auth?.currentUser?.uid
  if (uid) {
    const userDataRef = doc(db, 'usersData', uid)
    const exercisesRef = collection(userDataRef, 'exercises')
    const exerciseQ = query(exercisesRef)
    const exerciseQuerySnapshot = await getDocs(exerciseQ)

    const titles: string[] = []

    exerciseQuerySnapshot.forEach(doc => {
      const exerciseData = doc.data() as WorkoutDataType
      let exerciseTitle = exerciseData.name.toLowerCase().trim()
      titles.push(exerciseTitle)
      // workoutTitles[exerciseTitle] = ++workoutTitles[exerciseTitle] || 1
      // workoutTitle = workoutTitle.replace('day', '').toLowerCase()
      // if (workoutTitle === 'leg') workoutTitle = 'legs'

      // console.log(workoutData.name, workoutTitle)
      // updateDoc(doc.ref, {
      //   name: workoutTitle,
      // })
    })

    // updateDoc(userDataRef, {
    //   workoutTitles,
    // })
    await updateUniqueTitles('exerciseTitles', titles)
  }
}
