import React, { useState } from 'react'
import { ExerciseDataType, WorkoutDataType } from '../../types'
import { parseExercise } from '../../util/parseExercise'
import {
  deleteWorkout,
  updateExercise,
  updateWorkout,
} from '../../services/tracker'
import toast from 'react-hot-toast'
import WorkoutTitle from './WorkoutTitle'
import { formatDateToString } from '../../util/dateUtil'
import ActionsDropdown from '../ActionsDropdown/ActionsDropdown'
import { BsPencilSquare, BsTrashFill } from 'react-icons/bs'
import ExerciseItem from './ExerciseItem'
import EditingWorkout from './EditingWorkout'

type WorkoutItemProps = {
  workout: WorkoutDataType
  setWorkoutList: React.Dispatch<React.SetStateAction<WorkoutDataType[]>>
}

const WorkoutItem = ({ workout, setWorkoutList }: WorkoutItemProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdateExercise = (
    exerciseID: string,
    updatedExerciseStr: string,
    originalExerciseStr: string
  ) => {
    const currExercise = workout.exercises.find(ex => ex.id === exerciseID)
    if (currExercise?.originalString !== updatedExerciseStr)
      if (currExercise) {
        const parsedExercise = parseExercise(updatedExerciseStr, exerciseID)
        // const updatedWorkoutList: WorkoutDataType[] = workoutList.map(
        //   currWorkout => {
        //     if (currWorkout.id === workout.id) {
        //       const updatedExercises = workout.exercises.map(ex => {
        //         if (ex.id === exerciseID) return currExercise
        //         return ex
        //       })
        //       const updatedWorkout: WorkoutDataType = {
        //         ...currWorkout,
        //         exercises: updatedExercises,
        //       }
        //       return updatedWorkout
        //     }
        //     return currWorkout
        //   }
        // )
        // setWorkoutList(updatedWorkoutList)
        const originalExerciseName = parseExercise(originalExerciseStr).name
        updateExercise(
          exerciseID,
          workout.id,
          workout.exercises,
          parsedExercise,
          originalExerciseName
        )
      }
  }
  const handleUpdateTitle = (updatedTitle: string) => {
    if (workout.name !== updatedTitle) {
      updateWorkout(workout, { name: updatedTitle })
    }
  }
  const date = workout.date

  const handleDeleteWorkout = () => {
    const deletePromise = deleteWorkout(workout.id)
    deletePromise.then(() => {
      setWorkoutList(prev => prev.filter(w => w.id !== workout.id))
    })
    toast.promise(
      deletePromise,
      {
        loading: 'Deleting...',
        success: 'Workout Deleted',
        error: 'Failed To Delete',
      },
      {
        position: 'bottom-center',
      }
    )
  }
  const handleEditWorkout = () => {
    setIsEditing(true)
    console.log('EDITING')
  }

  const handleExerciseEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
    currArr: ExerciseDataType[]
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (index === currArr.length - 1) {
        console.log('HERE')
      }
    }
  }
  if (isEditing)
    return <EditingWorkout workout={workout} setIsEditing={setIsEditing} />

  return (
    <div className='single-workout'>
      <div className='head'>
        <WorkoutTitle
          title={workout.name}
          handleUpdateTitle={handleUpdateTitle}
        />
        {date && <div className='date'>{formatDateToString(date)}</div>}
        <div className='actions'>
          <ActionsDropdown
            buttons={[
              {
                text: 'Edit',
                icon: <BsPencilSquare className='icon' />,
                type: 'default',
                action: handleEditWorkout,
              },
              {
                text: 'Delete',
                icon: <BsTrashFill className='icon' />,
                type: 'danger',
                action: handleDeleteWorkout,
              },
            ]}
          />
        </div>
      </div>
      <div className='exercise-list'>
        {workout.exercises.map((exercise, index, currArr) => {
          return (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              handleUpdateExercise={handleUpdateExercise}
              handleEnter={e => handleExerciseEnter(e, index, currArr)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default WorkoutItem
