import React, { useState } from 'react'
import './ExerciseList.scss'
import { parseExerciseData } from '../../util/parseExerciseData'
import { AiFillInfoCircle, AiOutlinePlusCircle } from 'react-icons/ai'
import InfoModal from '../InfoModal/InfoModal'
import FormInput from '../FormInput/FormInput'

type ExerciseInputsProps = {
  exercise: ExerciseType
  idx: number
}
const ExerciseInputs = ({ exercise, idx }: ExerciseInputsProps) => {
  const [name, setName] = useState('')
  const [data, setData] = useState('')

  return (
    <div className='exercise-container'>
      {/* <h5>Exercise {idx + 1}</h5> */}
      <FormInput
        val={name}
        setVal={setName}
        label={`Exercise ${idx + 1}`}
        LabelInfo={idx === 0 ? <InfoModal /> : null}
        placeholder='deadlifts 100 3x8'
      />
      {/* <FormInput
        val={data}
        setVal={setData}
        label='Weight, Sets x Reps'
        placeholder='100 8x2, 7 / 90 8x3'
      /> */}
    </div>
  )
}

type ExerciseType = {
  name: string
  sets: { reps: number | null; weight: number | null }[]
}

const initialExercise: ExerciseType = {
  name: '',
  sets: [{ reps: null, weight: null }],
}

const ExerciseList = () => {
  const [exercises, setExercises] = useState<ExerciseType[]>([initialExercise])

  const handleAddExercise = () => {
    setExercises(prev => [...prev, initialExercise])
  }

  return (
    <div className='exercise-list'>
      {exercises.map((ex, idx) => {
        return <ExerciseInputs exercise={ex} idx={idx} />
      })}
      <div className='add-exercise'>
        <button className='btn-no-styles' onClick={handleAddExercise}>
          <AiOutlinePlusCircle className='icon' />
          Add Exercise
        </button>
      </div>
    </div>
  )
}

export default ExerciseList
