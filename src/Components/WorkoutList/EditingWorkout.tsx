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
import { MdClose } from 'react-icons/md'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { BsTrashFill } from 'react-icons/bs'

const idRefHash: { [x: string]: React.RefObject<HTMLInputElement> } = {}

type EditInputProps = {
  val: string
  setVal: (val: string) => void
  label?: string
  handleEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: React.RefObject<HTMLInputElement>
  removeInput?: () => void
  onBlur?: () => void
}

const EditInput = ({
  label,
  val,
  setVal,
  handleEnter,
  inputRef,
  removeInput,
  onBlur,
}: EditInputProps) => {
  return (
    <div className='edit-input-container'>
      {label && <label className='label'>{label}</label>}

      <div className='input-container'>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleEnter}
          ref={inputRef}
          onBlur={onBlur}
        />
        {removeInput && (
          <button
            className='btn-no-styles remove-exercise-btn'
            onClick={() => removeInput()}
          >
            <MdClose className='icon' />
          </button>
        )}
      </div>
    </div>
  )
}

type EditExerciseProps = {
  exercise: InitialExerciseType
  handleEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void
  removeExercise: (id: string) => void
}
const EditExercise = ({
  exercise,
  handleEnter,
  removeExercise,
}: EditExerciseProps) => {
  const [text, setText] = useState(exercise.text)
  const inputRef = useRef<HTMLInputElement>(null)
  const exerciseID = exercise.id ?? ''
  useEffect(() => {
    if (exercise.id) {
      idRefHash[exercise.id] = inputRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleBlur = () => {}

  return (
    <EditInput
      val={text}
      setVal={setText}
      handleEnter={handleEnter}
      inputRef={inputRef}
      removeInput={() => removeExercise(exerciseID)}
      onBlur={handleBlur}
    />
  )
}

type EditingWorkoutProps = {
  workout: WorkoutDataType
  setIsEditing: (val: boolean) => void
}

const EditingWorkout = ({ workout, setIsEditing }: EditingWorkoutProps) => {
  const [workoutTitle, setWorkoutTitle] = useState(workout.name)
  const [date, setDate] = useState<string>(
    workout.date ? formatDateToString(workout.date) : ''
  )
  const [modifiedExercises, setModifiedExercises] = useState<
    InitialExerciseType[]
  >(workout.exercises.map(ex => ({ id: ex.id, text: ex.originalString })))

  const removeExercise = (exerciseID: string) => {
    setModifiedExercises(prev => prev.filter(ex => ex.id !== exerciseID))
  }
  const handleAddExercise = () => {}
  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className='editing-workout'>
      <EditInput
        val={workoutTitle}
        setVal={setWorkoutTitle}
        label={'Workout Title'}
      />
      <EditInput val={date} setVal={setDate} label={'Date'} />

      <label>Exercises</label>
      <div className='exercises-container'>
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
              removeExercise={removeExercise}
            />
          )
        })}
      </div>
      <div className='add-exercise'>
        <button className='btn-no-styles' onClick={handleAddExercise}>
          <AiOutlinePlusCircle className='icon' />
          Add Exercise
        </button>
      </div>
      <div className='actions'>
        <div className='left'>
          <button className='delete-btn'>
            <BsTrashFill /> Delete
          </button>
        </div>
        <div className='right'>
          <button className='cancel-btn' onClick={handleCancel}>
            Cancel
          </button>
          <button className='save-btn'>Save</button>
        </div>
      </div>
    </div>
  )
}

export default EditingWorkout
