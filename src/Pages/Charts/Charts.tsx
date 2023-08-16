import React, { useEffect, useState } from 'react'
import { getUniqueTitles, queryChartExerciseData } from '../../services/tracker'

import './Charts.scss'
import { stringArrToSelectArr } from '../../util/stringArrToSelectArr'
import ChartSelect from '../../Components/ChartSelect/ChartSelect'
import {
  ExerciseSelectType,
  ExercisesServerDataType,
  TimePeriodType,
} from '../../types'
import ExerciseChart from '../../Components/ExerciseChart/ExerciseChart'
import { convertToTimeNumber } from '../../util/chartUtil'
import toast from 'react-hot-toast'

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
  const [loading, setLoading] = useState(false)

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
      setLoading(true)
      queryChartExerciseData(
        selectedExercise.value,
        convertToTimeNumber(timeSpan)
      )
        .then(res => {
          if (res?.data) {
            setExerciseData(res.data ?? null)
          } else {
            setExerciseData(null)
          }
          setLoading(false)
        })
        .catch((error: any) => {
          toast.error(error, { position: 'bottom-center' })
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
          loading={loading}
        />
      </div>
    </div>
  )
}

export default Charts
