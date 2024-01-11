import React, { useEffect, useRef, useState } from 'react'
import {
  ExerciseDataType,
  InitialExerciseType,
  WorkoutDataType,
} from '../../types'
import WorkoutTitle from './WorkoutTitle'
import FormInput from '../FormInput/FormInput'
import './EditingWorkout.scss'
import { formatDateToString } from '../../util/dateUtil'

const idRefHash: { [x: string]: React.RefObject<HTMLInputElement> } = {}

type EditInputProps = {
  val: string
  setVal: (val: string) => void
  label?: string
  handleEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: React.RefObject<HTMLInputElement>
}

const EditInput = ({
  label,
  val,
  setVal,
  handleEnter,
  inputRef,
}: EditInputProps) => {
  return (
    <div className='edit-input-container'>
      {label && <label className='label'>{label}</label>}
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleEnter}
        ref={inputRef}
      />
    </div>
  )
}

type EditExerciseProps = {
  exercise: InitialExerciseType
  handleEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void
}
const EditExercise = ({ exercise, handleEnter }: EditExerciseProps) => {
  const [text, setText] = useState(exercise.text)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (exercise.id) {
      idRefHash[exercise.id] = inputRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <EditInput
      val={text}
      setVal={setText}
      handleEnter={handleEnter}
      inputRef={inputRef}
    />
  )
}

type EditingWorkoutProps = {
  workout: WorkoutDataType
}

const EditingWorkout = ({ workout }: EditingWorkoutProps) => {
  const [workoutTitle, setWorkoutTitle] = useState(workout.name)
  const [date, setDate] = useState<string>(
    workout.date ? formatDateToString(workout.date) : ''
  )
  const [modifiedExercises, setModifiedExercises] = useState<
    InitialExerciseType[]
  >(workout.exercises.map(ex => ({ id: ex.id, text: ex.originalString })))

  return (
    <div className='editing-workout'>
      <EditInput
        val={workoutTitle}
        setVal={setWorkoutTitle}
        label={'Workout Title'}
      />
      <EditInput val={date} setVal={setDate} label={'Date'} />

      <label>Exercises</label>
      {modifiedExercises.map((exercise, index, currArr) => {
        const handleEnter = (
          e: React.KeyboardEvent<HTMLInputElement>,
          index: number,
          currArr: InitialExerciseType[]
        ) => {
          e.preventDefault()

          if (index >= currArr.length - 1) {
            // setModifiedExercises
          }
        }
        return (
          <EditExercise
            exercise={exercise}
            handleEnter={e => handleEnter(e, index, currArr)}
          />
        )
      })}
    </div>
  )
}

export default EditingWorkout
