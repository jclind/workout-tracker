export type ExerciseDataType = {
  name: string
  weights: WeightGroupType[]
}

export type WeightGroupType = {
  sets: number[]
  weight: number
  comment: string
}
