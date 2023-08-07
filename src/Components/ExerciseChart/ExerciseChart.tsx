import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  TimeScale, //Import timescale instead of category for X axis
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js'
import {
  ExerciseSelectType,
  ExercisesServerDataType,
  TimePeriodType,
} from '../../types'
import 'chartjs-adapter-moment'

import styles from '../../_exports.scss'
import './ExerciseChart.scss'
import {
  formatChartData,
  getChartTimeUnit,
  getStartOfDayArrayByPeriod,
  getStepSize,
} from '../../util/chartUtil'

ChartJS.register(
  TimeScale, //Register timescale instead of category for X axis
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
)

const timeSpanButtons: TimePeriodType[] = [
  'week',
  'month',
  '3-month',
  '6-month',
  'year',
]

type ExerciseChartProps = {
  exerciseData: ExercisesServerDataType[] | null
  timeSpan: TimePeriodType
  selectedExercise: ExerciseSelectType | null
  setTimeSpan: React.Dispatch<React.SetStateAction<TimePeriodType>>
}

const ExerciseChart = ({
  exerciseData,
  timeSpan,
  selectedExercise,
  setTimeSpan,
}: ExerciseChartProps) => {
  const { formattedData, yMin, yMax } = formatChartData(exerciseData)
  const dates = getStartOfDayArrayByPeriod(timeSpan)

  const options: any = {
    scales: {
      y: {
        min: yMin,
        max: yMax,
        ticks: {
          stepSize: getStepSize(yMin, yMax),
        },
        grid: {
          color: styles.tertiaryBackground,
        },
      },
      x: {
        type: 'time',
        time: getChartTimeUnit(timeSpan),
        min: new Date(dates[0]),
        max: new Date(dates[dates.length - 1]),
        offset: true,
        grid: {
          color: styles.tertiaryBackground,
        },
      },
    },
  }
  const data = {
    datasets: [
      {
        label: selectedExercise?.label ?? '',
        data: formattedData,
        borderColor: styles.secondary,
        lineTension: 0.2,
      },
    ],
  }
  console.log(formattedData, yMin, yMax)
  return (
    <>
      <div className='chart-head'>
        <h4>{selectedExercise?.label} Chart</h4>
        <div className='time-range'>
          {timeSpanButtons.map(val => {
            return (
              <button
                key={val}
                className={`time-option btn-no-styles ${
                  timeSpan === val ? 'active' : ''
                }`}
                onClick={() => setTimeSpan(val)}
              >
                {val.replace('-', '').match(/^(.*?[A-Za-z])/)?.[1]}
              </button>
            )
          })}
        </div>
      </div>
      {data ? <Line data={data} options={options} className='chart' /> : null}
    </>
  )
}

export default ExerciseChart
