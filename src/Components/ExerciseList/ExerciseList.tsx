import React, { RefObject, useEffect, useRef, useState } from 'react'
import './ExerciseList.scss'
import { parseExerciseData } from '../../util/parseExerciseData'
import { AiFillInfoCircle, AiOutlinePlusCircle } from 'react-icons/ai'
import InfoModal from '../InfoModal/InfoModal'
import FormInput from '../FormInput/FormInput'
import { v4 as uuidv4 } from 'uuid'
import { searchExercises } from '../../services/tracker'
import { parseExercise } from '../../util/parseExercise'
import { WeightGroupType } from '../../types'
import { getDataFromExercise } from '../../util/getDataFromExercise'
import ViewAllExercisesModal from '../ViewAllExercisesModal/ViewAllExercisesModal'

const idRefHash: { [x: string]: React.RefObject<HTMLInputElement> } = {}

type ExerciseInputsProps = {
  exercise: ExerciseType
  idx: number
  numExercises: number
  exercises: ExerciseType[]
  addExercise: () => string
  removeExercise: (id: string) => void
}

const ExerciseInputs = ({
  exercise,
  idx,
  numExercises,
  exercises,
  addExercise,
  removeExercise,
}: ExerciseInputsProps) => {
  const [exerciseStr, setExerciseStr] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [prevExerciseData, setPrevExerciseData] = useState<string>('')
  const [data, setData] = useState('')
  const [suggestedName, setSuggestedName] = useState('')

  const nextID = exercises[idx + 1]?.id || null

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (exercise.id) {
      idRefHash[exercise.id] = inputRef
    }
  }, [])

  useEffect(() => {
    const parsedExerciseData = parseExercise(exerciseStr)
    setExerciseName(parsedExerciseData.name)
  }, [exerciseStr])

  useEffect(() => {
    // if (!exerciseStr) setSuggestedName('')
    const delayDebounce = setTimeout(() => {
      if (exerciseStr) {
        searchExercises(exerciseName.toLowerCase()).then(res => {
          if (res) {
            setSuggestedName(res.name)
            const prevData = getDataFromExercise(res)
            console.log(prevData)
            setPrevExerciseData(prevData)
          }
        })
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [exerciseName])

  const handleEnter = (id: string | null) => {
    console.log('Curr:', exercise.id, 'Next:', id)
    if (id) {
      const focusRef = idRefHash[id]
      console.log(idRefHash)
      console.log(focusRef)
      console.log(id)
      if (id && focusRef && focusRef.current) {
        focusRef.current.focus()
      }
    } else {
      const nextID = addExercise()
      setTimeout(() => {
        handleEnter(nextID)
      }, 0)
    }
  }

  const handleBackspace = () => {
    if (numExercises > 1) {
      removeExercise(exercise.id)

      const nextExerciseFocus = exercises[idx - 1] || exercises[0]
      const nextExerciseFocusID = nextExerciseFocus.id
      const focusRef = idRefHash[nextExerciseFocusID]
      if (nextExerciseFocusID && focusRef && focusRef.current) {
        focusRef.current.focus()
      }
    }
  }

  return (
    <div className='exercise-container'>
      <FormInput
        val={exerciseStr}
        setVal={setExerciseStr}
        label={`Exercise ${idx + 1}`}
        LabelInfo={idx === 0 ? <InfoModal /> : null}
        placeholder='deadlifts 100 3x8'
        inputID={exercise.id}
        onEnter={handleEnter}
        onBackspaceEmpty={handleBackspace}
        nextID={nextID}
        inputRef={inputRef}
        suggestedText={suggestedName}
      />
      {numExercises > 1 && (
        <button
          className='btn-no-styles remove-exercise-btn'
          onClick={() => removeExercise(exercise.id)}
        >
          remove
        </button>
      )}
      {suggestedName &&
      exerciseName &&
      suggestedName === exerciseName.toLowerCase() ? (
        <div className='prev-exercise-data'>
          <span>Prev weights / sets: </span>
          {prevExerciseData}
          <button className='btn-no-styles view-all-btn'>(view all)</button>
          <ViewAllExercisesModal exerciseName={exerciseName.toLowerCase()} />
        </div>
      ) : null}
    </div>
  )
}

type ExerciseType = {
  id: string
  name: string
  sets: { reps: number | null; weight: number | null }[]
}

const generateNewExercise = (): ExerciseType => {
  const id = uuidv4()
  return {
    id,
    name: '',
    sets: [{ reps: null, weight: null }],
  }
}

const ExerciseList = () => {
  // const [idRefHash, setIdRefHash] = useState<{ [x: string]: React.RefObject<HTMLInputElement> }>({})

  const [exercises, setExercises] = useState<ExerciseType[]>([
    generateNewExercise(),
  ])
  const [workoutTitle, setWorkoutTitle] = useState('')

  const [titleNextFocusRef, setTitleNextFocusRef] =
    useState<React.RefObject<HTMLInputElement>>()

  useEffect(() => {
    setTitleNextFocusRef(idRefHash[exercises[0].id])
  }, [exercises])

  const handleAddExercise = (): string => {
    const newExercise = generateNewExercise()
    setExercises(prev => [...prev, newExercise])
    return newExercise.id
  }
  const handleRemoveExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id))
  }

  // useEffect(() => {
  //   modifyData()
  // }, [])

  return (
    <div className='exercise-form'>
      <FormInput
        val={workoutTitle}
        setVal={setWorkoutTitle}
        label='Workout Title'
        nextFocusRef={titleNextFocusRef}
      />
      <div className='exercise-list'>
        {exercises.map((ex, idx, exercises) => {
          return (
            <ExerciseInputs
              exercise={ex}
              idx={idx}
              numExercises={exercises.length}
              addExercise={handleAddExercise}
              removeExercise={handleRemoveExercise}
              exercises={exercises}
            />
          )
        })}
        <div className='add-exercise'>
          <button className='btn-no-styles' onClick={handleAddExercise}>
            <AiOutlinePlusCircle className='icon' />
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExerciseList
