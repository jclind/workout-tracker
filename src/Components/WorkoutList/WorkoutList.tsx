import React, { useEffect, useRef, useState } from 'react'
import './WorkoutList.scss'
import { ExerciseDataType, WorkoutDataType } from '../../types'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { getWorkouts, updateExercise } from '../../services/tracker'
import { formatDateToString } from '../../util/dateUtil'
import { parseExercise } from '../../util/parseExercise'

type ExerciseItemProps = {
  exercise: ExerciseDataType
  handleUpdateExercise: (exerciseID: string, updatedExerciseStr: string) => void
}
const ExerciseItem = ({
  exercise,
  handleUpdateExercise,
}: ExerciseItemProps) => {
  const [editedStr, setEditedStr] = useState(exercise.originalString)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (editedStr.trim() && editedStr.trim() !== exercise.originalString) {
      handleUpdateExercise(exercise.id, editedStr)
    }
  }

  return (
    <input
      className={`exercise ${isFocused ? 'focused' : 'blurred'}`}
      value={editedStr}
      onChange={e => setEditedStr(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={inputRef}
    />
  )
}

type WorkoutListProps = {
  workoutList: WorkoutDataType[]
  setWorkoutList: React.Dispatch<React.SetStateAction<WorkoutDataType[]>>
}

const WorkoutList = ({ workoutList, setWorkoutList }: WorkoutListProps) => {
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)

  useEffect(() => {
    getNextWorkouts()
  }, [])

  const getNextWorkouts = () => {
    getWorkouts(10, lastDoc).then(res => {
      if (res?.data) {
        setWorkoutList(res.data)
        setLastDoc(res.lastDoc)
      }
    })
  }

  return (
    <div className='workout-list-container'>
      <div className='workout-list'>
        {workoutList.map(workout => {
          const handleUpdateExercise = (
            exerciseID: string,
            updatedExerciseStr: string
          ) => {
            const currExercise = workout.exercises.find(
              ex => ex.id === exerciseID
            )
            if (currExercise?.originalString !== updatedExerciseStr)
              if (currExercise) {
                const parsedExercise = parseExercise(updatedExerciseStr)
                updateExercise(
                  exerciseID,
                  workout.id,
                  workout.exercises,
                  parsedExercise
                )
              }
          }
          const date = workout.date
          return (
            <div className='single-workout' key={workout.id}>
              <div className='head'>
                <h3 className='title'>{workout.name}</h3>
                {date && <div className='date'>{formatDateToString(date)}</div>}
              </div>
              <div className='exercise-list'>
                {workout.exercises.map(exercise => {
                  return (
                    <ExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      handleUpdateExercise={handleUpdateExercise}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorkoutList
