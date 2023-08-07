import React, { useEffect, useState } from 'react'
import {
  getUniqueTitles,
  queryChartExerciseData,
} from '../../../services/tracker'

import './Charts.scss'
import { stringArrToSelectArr } from '../../../util/stringArrToSelectArr'
import ChartSelect from '../../ChartSelect/ChartSelect'
import {
  ExerciseSelectType,
  ExercisesServerDataType,
  TimePeriodType,
} from '../../../types'
import ExerciseChart from '../../ExerciseChart/ExerciseChart'
import { convertToTimeNumber } from '../../../util/chartUtil'

const Charts = () => {
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseSelectType | null>(null)
  const [exerciseList, setExerciseList] = useState<
    { label: string; value: string }[]
  >([])
  const [timeSpan, setTimeSpan] = useState<TimePeriodType>('week')
  const [exerciseData, setExerciseData] = useState<
    ExercisesServerDataType[] | null
  >(null)

  useEffect(() => {
    getUniqueTitles('exerciseTitles').then(res => {
      if (res) {
        const selectArr = stringArrToSelectArr(res)
        setExerciseList(selectArr)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      queryChartExerciseData(
        selectedExercise.value,
        convertToTimeNumber(timeSpan)
      ).then(res => {
        if (res?.data) {
          setExerciseData(res.data ?? null)
        } else {
          setExerciseData(null)
        }
      })
    } else {
      setExerciseData(null)
    }
  }, [selectedExercise, timeSpan])

  return (
    <div className='charts-page'>
      <div className='search-container'>
        <ChartSelect
          options={exerciseList}
          selectedOption={selectedExercise}
          setSelectedOption={setSelectedExercise}
        />
      </div>
      <div className='chart-container'>
        <ExerciseChart
          exerciseData={exerciseData}
          timeSpan={timeSpan}
          selectedExercise={selectedExercise}
          setTimeSpan={setTimeSpan}
        />
      </div>
    </div>
  )
}

export default Charts
