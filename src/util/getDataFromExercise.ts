import { ExerciseDataType, WeightGroupType } from '../types'

export const getDataFromExercise = (exercise: ExerciseDataType) => {
  let originalStr = exercise.originalString.toLowerCase()

  originalStr = originalStr.replace(exercise.name, '').trim()

  exercise.weights.forEach(weightGroup => {
    const currWeight = weightGroup.weight.toString()
    const currComment = weightGroup.comment.toLowerCase()
    originalStr = originalStr.replace(currWeight, currWeight + 'lbs')
    originalStr = originalStr.replace(currComment, '')
  })

  return originalStr.trim()
}
