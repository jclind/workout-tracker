import React, { useEffect, useRef, useState } from 'react'
import {
  ExerciseDataType,
  InitialExerciseType,
  WorkoutDataType,
} from '../../types'
import WorkoutTitle from './WorkoutTitle'
import FormInput from '../FormInput/FormInput'
import './EditingWorkout.scss'
import {
  formatDateToMMMDDYYYY,
  formatDateToString,
  getMonthDay,
} from '../../util/dateUtil'
import { MdClose } from 'react-icons/md'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { BsTrashFill } from 'react-icons/bs'
import { generateNewExercise } from '../../util/generateNewExercise'
import { updateWorkout } from '../../services/tracker'
import { parseExercise } from '../../util/parseExercise'
import styles from '../../_exports.scss'
import { TailSpin } from 'react-loader-spinner'
import { getTitleAndDate } from '../../util/getTitleAndDate'

const idRefHash: { [x: string]: React.RefObject<HTMLInputElement> } = {}

type EditInputProps = {
  val: string
  setVal: (val: string) => void
  label?: string
  disabled?: boolean
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
  disabled,
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

      <div className={`input-container ${disabled ? 'disabled' : ''}`}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          onBlur={onBlur}
          disabled={disabled}
        />
        {removeInput && (
          <button
            className='btn-no-styles remove-exercise-btn'
            onClick={() => removeInput()}
            disabled={disabled}
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
  updateExerciseText: (exerciseID: string, updatedText: string) => void
  removeExercise: (id: string) => void
  handleBackspace: () => void
  disabled: boolean
}
const EditExercise = ({
  exercise,
  handleEnter,
  updateExerciseText,
  removeExercise,
  handleBackspace,
  disabled,
}: EditExerciseProps) => {
  const [updatedText, setUpdatedText] = useState(exercise.text)
  const inputRef = useRef<HTMLInputElement>(null)
  const exerciseID = exercise.id ?? ''
  useEffect(() => {
    if (exercise.id) {
      idRefHash[exercise.id] = inputRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handleBlur = () => {
    updateExerciseText(exercise.id, updatedText)
  }

  return (
    <EditInput
      val={updatedText}
      setVal={setUpdatedText}
      handleEnter={() => handleEnter(exerciseID)}
      inputRef={inputRef}
      removeInput={() => removeExercise(exerciseID)}
      onBlur={handleBlur}
      onBackspaceEmpty={handleBackspace}
      disabled={disabled}
    />
  )
}

type EditingWorkoutProps = {
  workout: WorkoutDataType
  setWorkout: (workout: WorkoutDataType) => void
  setIsEditing: (val: boolean) => void
}

const EditingWorkout = ({
  workout,
  setWorkout,
  setIsEditing,
}: EditingWorkoutProps) => {
  const [workoutTitle, setWorkoutTitle] = useState(workout.name)
  const [date, setDate] = useState<number>(workout.date ?? new Date().getTime())
  const [dateInputString, setDateInputString] = useState<string>(
    getMonthDay(date)
  )
  const [modifiedExercises, setModifiedExercises] = useState<
    InitialExerciseType[]
  >(workout.exercises.map(ex => ({ id: ex.id, text: ex.originalString })))

  const [isSaveLoading, setIsSaveLoading] = useState(false)

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
  const handleSaveEdit = async () => {
    setIsSaveLoading(true)
    const newExercises: ExerciseDataType[] = modifiedExercises.map(ex =>
      parseExercise(ex.text, ex.id)
    )
    const updatedData = {
      name: workoutTitle,
      date: date,
      exercises: newExercises,
    }
    await updateWorkout(workout, updatedData)
    const updatedWorkout: WorkoutDataType = { ...workout, ...updatedData }
    setWorkout(updatedWorkout)
    setIsSaveLoading(false)
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

  useEffect(() => {
    const newDate = getTitleAndDate(dateInputString).date

    setDate(newDate ?? new Date().getTime())
  }, [dateInputString])

  const updateExerciseText = async (
    exerciseID: string,
    updatedText: string
  ) => {
    setIsSaveLoading(true)
    const updatedExercise = modifiedExercises.map(ex => {
      if (ex.id === exerciseID) {
        return { ...ex, text: updatedText }
      }
      return ex
    })
    await setModifiedExercises(updatedExercise)
    setIsSaveLoading(false)
  }

  return (
    <div className='editing-workout'>
      <EditInput
        val={workoutTitle}
        setVal={setWorkoutTitle}
        label={'Workout Title'}
        disabled={isSaveLoading}
      />
      <EditInput
        val={dateInputString}
        setVal={setDateInputString}
        label={'Date'}
        disabled={isSaveLoading}
      />

      <label>Exercises</label>
      <div className='exercises-container'>
        {modifiedExercises.map((exercise, index, currArr) => {
          return (
            <EditExercise
              key={exercise.id}
              exercise={exercise}
              handleEnter={id => handleEnter(id, index, currArr)}
              updateExerciseText={updateExerciseText}
              removeExercise={removeExercise}
              handleBackspace={() => handleBackspace(index, currArr)}
              disabled={isSaveLoading}
            />
          )
        })}
      </div>
      <div className='add-exercise'>
        <button
          className='btn-no-styles'
          onClick={addExercise}
          disabled={isSaveLoading}
        >
          <AiOutlinePlusCircle className='icon' />
          Add Exercise
        </button>
      </div>
      <div className='actions'>
        <div className='left'>
          <button className='delete-btn' disabled={isSaveLoading}>
            <BsTrashFill /> Delete
          </button>
        </div>
        <div className='right'>
          <button
            className='cancel-btn'
            onClick={handleCancel}
            disabled={isSaveLoading}
          >
            Cancel
          </button>
          <button
            className='save-btn'
            onClick={handleSaveEdit}
            disabled={isSaveLoading}
          >
            {isSaveLoading ? (
              <TailSpin
                height='25'
                width='25'
                color={styles.primaryText}
                ariaLabel='loading'
              />
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditingWorkout
