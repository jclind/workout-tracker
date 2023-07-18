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

export type WeightGroupType = {
  sets: number[]
  weight: number
  comment: string
}
