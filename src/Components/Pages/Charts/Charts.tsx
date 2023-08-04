import React, { useEffect, useState } from 'react'
import {
  getUniqueTitles,
  queryChartExerciseData,
} from '../../../services/tracker'

import './Charts.scss'
import { stringArrToSelectArr } from '../../../util/stringArrToSelectArr'
import ChartSelect from '../../ChartSelect/ChartSelect'
import {
  ExerciseDataType,
  ExerciseSelectType,
  ExercisesServerDataType,
  TimePeriodType,
} from '../../../types'
import ExerciseChart from '../../ExerciseChart/ExerciseChart'

const convertToTimeNumber = (
  timePeriod: 'week' | 'month' | 'year' | 'allTime'
): number => {
  const currentDate = new Date()

  if (timePeriod === 'allTime') {
    return 0
  } else if (timePeriod === 'year') {
    const oneYearAgo = new Date(
      currentDate.getFullYear() - 1,
      currentDate.getMonth(),
      currentDate.getDate()
    )
    return oneYearAgo.getTime()
  } else if (timePeriod === 'month') {
    const oneMonthAgo = new Date(currentDate.getTime())
    oneMonthAgo.setMonth(currentDate.getMonth() - 1)
    return oneMonthAgo.getTime()
  } else if (timePeriod === 'week') {
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    return oneWeekAgo.getTime()
  } else {
    throw new Error('Invalid time period')
  }
}

const getChartLabels = (
  timePeriod: 'week' | 'month' | 'year' | 'allTime'
): string[] => {
  const now = new Date()
  const chartLabels: string[] = []

  if (timePeriod === 'allTime') {
    return ['All Time']
  } else if (timePeriod === 'year') {
    const currentMonth = now.getMonth()
    const months: string[] = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12
      chartLabels.push(months[monthIndex])
    }
  } else if (timePeriod === 'month') {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate()
    for (let i = 0; i < 12; i++) {
      const day = Math.round(i * (daysInMonth / 11)) + 1
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        daysInMonth - day + 1
      )
      chartLabels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }
  } else if (timePeriod === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i++) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      chartLabels.push(days[day.getDay()])
    }
  } else {
    throw new Error('Invalid time period')
  }

  return chartLabels.reverse() // Reverse the array to show dates in the past
}

const Charts = () => {
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseSelectType | null>(null)
  const [exerciseList, setExerciseList] = useState<
    { label: string; value: string }[]
  >([])
  const [timeSpan, setTimeSpan] = useState<TimePeriodType>('month')
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
    // console.log(getStartOfDayArrayByPeriod('year'))
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      console.log(convertToTimeNumber(timeSpan), new Date().getTime())
      queryChartExerciseData(
        selectedExercise.value,
        convertToTimeNumber(timeSpan)
      ).then(res => {
        console.log(res)
        if (res?.data) {
          setExerciseData(res.data ?? null)
        } else {
          setExerciseData(null)
        }
      })
    } else {
      setExerciseData(null)
    }
  }, [selectedExercise])

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
        <ExerciseChart exerciseData={exerciseData} />
      </div>
    </div>
  )
}

export default Charts
