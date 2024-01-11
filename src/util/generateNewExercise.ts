import { v4 as uuidv4 } from 'uuid'
import { InitialExerciseType } from '../types'

export const generateNewExercise = (): InitialExerciseType => {
  const id = uuidv4()
  return {
    id,
    text: '',
  }
}
