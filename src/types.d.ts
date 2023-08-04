export type WorkoutDataType = {
  id: string
  name: string
  date: number | null
  exercises: ExerciseDataType[]
}

export type CurrentWorkoutType = {
  workoutTitle: string
  exercises: { id: string; text: string }[]
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
  workoutDate: number | null
  workoutID: string
}

export type WeightGroupType = {
  sets: number[]
  weight: number
  comment: string
}

export type ExerciseSelectType = { label: string; value: string }

export type TimePeriodType = 'week' | 'month' | 'year' | 'allTime'
