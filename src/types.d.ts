export type WorkoutDataType = {
  id: string
  name: string
  date: string
  exercises: ExerciseDataType[]
}

export type ExerciseDataType = {
  id: string
  name: string
  weights: WeightGroupType[]
  originalString: string
}

export type ExercisesServerDataType = {
  id: string
  index: number
  name: string
  originalString: string
  weights: WeightGroupType[]
  workoutDate: string
  workoutID: string
}

export type WeightGroupType = {
  sets: number[]
  weight: number
  comment: string
}
