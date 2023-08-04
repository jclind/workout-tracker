import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import './ExerciseChart.scss'
import { ExercisesServerDataType, TimePeriodType } from '../../types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const labels = ['January', 'February', 'March', 'April', 'May', 'June']

const getStartOfDayArrayByPeriod = (timePeriod: TimePeriodType): number[] => {
  const currentDate = new Date()
  const startOfDayArray: number[] = []

  if (timePeriod === 'allTime') {
    // For 'allTime', return an array with the current date only
    // const startDate = new Date(currentDate)
    // startDate.setHours(0, 0, 0, 0) // Set hours, minutes, seconds, and milliseconds to 0
    // startOfDayArray.push(startDate.getTime())
  } else if (timePeriod === 'year') {
    // For 'year', calculate the start of the year and add each day to the array
    const currentYear = currentDate.getFullYear()
    const startDate = new Date(currentYear, 0, 1) // Start of the current year
    for (
      let date = new Date(startDate);
      date <= currentDate;
      date.setDate(date.getDate() + 1)
    ) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      startOfDayArray.push(startOfDay.getTime())
    }
  } else if (timePeriod === 'month') {
    // For 'month', calculate the start of the month and add each day to the array
    const startDate = new Date(currentDate)
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - 29) // Go back to the last 30 days
    for (
      let date = new Date(startDate);
      date <= currentDate;
      date.setDate(date.getDate() + 1)
    ) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      startOfDayArray.push(startOfDay.getTime())
    }
  } else if (timePeriod === 'week') {
    // For 'week', calculate the start of one week ago and add each day to the array
    const startDate = new Date(currentDate)
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - 6) // Go back to the last 7 days
    for (
      let date = new Date(startDate);
      date <= currentDate;
      date.setDate(date.getDate() + 1)
    ) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      startOfDayArray.push(startOfDay.getTime())
    }
  } else {
    throw new Error('Invalid time period')
  }

  return startOfDayArray
}
const formatDateArray = (dateArray: number[]): string[] => {
  const formattedDates: string[] = []
  const options: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
  }

  for (const date of dateArray) {
    const formattedDate = new Date(date).toLocaleDateString(undefined, options)
    formattedDates.push(formattedDate)
  }

  return formattedDates
}

// const data = {
//   labels: labels,
//   datasets: [
//     {
//       label: 'My First dataset',
//       backgroundColor: 'rgb(255, 99, 132)',
//       borderColor: 'rgb(255, 99, 132)',
//       data: [0, 10, 5, 2, 20, 30, 45],
//     },
//   ],
// }

const options = {
  scales: {
    x: {
      type: 'category',
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    },
  },
}
// const options = {
//   scales: {
//     x: [
//       {
//         type: 'time',
//       },
//     ],
//   },
// }

type ExerciseChartProps = {
  exerciseData: ExercisesServerDataType[] | null
}

const ExerciseChart = ({ exerciseData }: ExerciseChartProps) => {
  console.log(exerciseData)
  const formattedData = exerciseData?.map(ex => {
    if (ex.weights.length > 0) {
      const maxWeight = ex.weights.reduce((max, weightGroup) => {
        const weight = Math.max(...weightGroup.sets) // Find the maximum weight in the sets array
        return Math.max(max, weight)
      }, ex.weights[0].weight)

      return { t: ex.workoutDate, y: maxWeight }
    }
  })
  console.log(formattedData)
  const data = {
    labels: getStartOfDayArrayByPeriod('week'),
    data: [{}],
  }
  return (
    <>
      test
      {/* <Line data={data} options={options} className='chart' /> */}
    </>
  )
}

export default ExerciseChart
