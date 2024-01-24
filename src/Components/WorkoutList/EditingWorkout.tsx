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
import { generateNewExercise } from '../../util/generateNewExercise'

const idRefHash: { [x: string]: React.RefObject<HTMLInputElement> } = {}

type EditInputProps = {
  val: string
  setVal: (val: string) => void
  label?: string
  handleEnter?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
  removeInput?: () => void
  onBlur?: () => void
  onBackspaceEmpty?: () => void
}

const EditInput = ({
  label,
  val,
  setVal,
  handleEnter,
  inputRef,
  removeInput,
  onBlur,
  onBackspaceEmpty,
}: EditInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && handleEnter) {
      e.preventDefault()
      handleEnter()
    }
    if (!val && e.key === 'Backspace' && onBackspaceEmpty) {
      e.preventDefault()
      onBackspaceEmpty()
    }
  }

  return (
    <div className='edit-input-container'>
      {label && <label className='label'>{label}</label>}

      <div className='input-container'>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
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
  handleEnter: (nextID: string) => void
  removeExercise: (id: string) => void
  handleBackspace: () => void
}
const EditExercise = ({
  exercise,
  handleEnter,
  removeExercise,
  handleBackspace,
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
      handleEnter={() => handleEnter(exerciseID)}
      inputRef={inputRef}
      removeInput={() => removeExercise(exerciseID)}
      onBlur={handleBlur}
      onBackspaceEmpty={handleBackspace}
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
  const addExercise = () => {
    const newExercise = generateNewExercise()
    setModifiedExercises(prev => [...prev, newExercise])
    return newExercise.id
  }
  const handleCancel = () => {
    setIsEditing(false)
  }
  const handleEnter = (
    id: string,
    index: number,
    exercises: InitialExerciseType[]
  ) => {
    if (index < exercises.length - 1) {
      const nextExerciseFocus = exercises[index + 1] || exercises[0]
      const nextExerciseFocusID = nextExerciseFocus.id
      const focusRef = idRefHash[nextExerciseFocusID]

      if (id && focusRef && focusRef.current) {
        focusRef.current.focus()
      }
    } else {
      const nextID = addExercise()
      setTimeout(() => {
        handleEnter(nextID, index, [...exercises, { id: nextID, text: '' }])
      }, 0)
    }
  }
  const handleBackspace = (index: number, exercises: InitialExerciseType[]) => {
    const numExercises = exercises.length
    const currExercise = exercises[index]
    if (numExercises > 1) {
      removeExercise(currExercise.id)

      const nextExerciseFocus = exercises[index - 1] || exercises[0]
      const nextExerciseFocusID = nextExerciseFocus.id
      const focusRef = idRefHash[nextExerciseFocusID]
      if (nextExerciseFocusID && focusRef && focusRef.current) {
        focusRef.current.focus()
      }
    }
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
          return (
            <EditExercise
              exercise={exercise}
              handleEnter={id => handleEnter(id, index, currArr)}
              removeExercise={removeExercise}
              handleBackspace={() => handleBackspace(index, currArr)}
            />
          )
        })}
      </div>
      <div className='add-exercise'>
        <button className='btn-no-styles' onClick={addExercise}>
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
