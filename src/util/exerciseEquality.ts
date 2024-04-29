import { ExerciseDataType, WeightGroupType } from '../types'

// export const getDifferentExercises = (e1: ExerciseDataType[], e2: ExerciseDataType[]) => {
//   let newExercises: ExerciseDataType = []
//   for (const exercise2 of e2) {
//     let isIdentical = false
//     for (const exercise1 of e1) {
//       if (exercisesAreEqual(exercise1, exercise2)) {
//         isIdentical = true
//         break
//       }
//     }
//     if (!isIdentical) {
//       newExercises.push(exercise2)
//     }
//   }
// }

export const exerciseArraysAreEqual = (
  e1: ExerciseDataType[],
  e2: ExerciseDataType[]
) => {}

export const findDeletedExercises = (
  e1: ExerciseDataType[],
  e2: ExerciseDataType[]
) => {
  const deletedExercises: ExerciseDataType[] = []

  const exerciseIdsInE2 = new Set(e2.map(exercise => exercise.id))

  for (const exercise1 of e1) {
    if (!exerciseIdsInE2.has(exercise1.id)) {
      deletedExercises.push(exercise1)
    }
  }

  return deletedExercises
}
export const findAddedExercises = (
  e1: ExerciseDataType[],
  e2: ExerciseDataType[]
) => {
  const addedExercises: ExerciseDataType[] = []

  const exerciseIdsInArray1 = new Set(e1.map(exercise => exercise.id))

  for (const exercise2 of e2) {
    if (!exerciseIdsInArray1.has(exercise2.id)) {
      addedExercises.push(exercise2)
    }
  }

  return addedExercises
}
export const findEditedExercises = (
  e1: ExerciseDataType[],
  e2: ExerciseDataType[]
): { original: ExerciseDataType[]; edited: ExerciseDataType[] } => {
  const exerciseIdsInArray2 = new Set(e2.map(exercise => exercise.id))

  const preservedExerciseIDs: string[] = []

  for (const exercise1 of e1) {
    if (exerciseIdsInArray2.has(exercise1.id)) {
      preservedExerciseIDs.push(exercise1.id)
    }
  }

  const originalExercises: ExerciseDataType[] = []
  const editedExercises: ExerciseDataType[] = []

  preservedExerciseIDs.forEach(id => {
    const originalExercise = e1.find(exercise1 => exercise1.id === id)
    const editedExercise = e2.find(exercise2 => exercise2.id === id)

    // if the exercises aren't equal add them to the editedExercises array
    if (
      originalExercise &&
      editedExercise &&
      !exercisesAreEqual(originalExercise, editedExercise)
    ) {
      originalExercises.push(originalExercise)
      editedExercises.push(editedExercise)
    }
  })

  return { original: originalExercises, edited: editedExercises }
}

export const exercisesAreEqual = (
  e1: ExerciseDataType,
  e2: ExerciseDataType
) => {
  return (
    e1.id === e2.id &&
    e1.name === e2.name &&
    e1.originalString === e2.originalString &&
    exerciseWeightsAreEqual(e1.weights, e2.weights)
  )
}

const exerciseWeightsAreEqual = (
  w1: WeightGroupType[],
  w2: WeightGroupType[]
) => {
  if (w1.length !== w2.length) {
    return false
  }

  for (let i = 0; i < w1.length; i++) {
    const weight1 = w1[i]
    const weight2 = w2[i]
    if (!weightsAreEqual(weight1, weight2)) {
      return false
    }
  }

  return true
}

// Checks if two 'WeightGroupType' objects are equal
const weightsAreEqual = (w1: WeightGroupType, w2: WeightGroupType) => {
  return (
    w1.weight === w2.weight &&
    w1.comment === w2.comment &&
    arraysAreEqual(w1.sets, w2.sets)
  )
}

// Checks if two arrays of numbers are equal
const arraysAreEqual = (arr1: number[], arr2: number[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}
