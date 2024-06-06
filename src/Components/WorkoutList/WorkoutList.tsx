import React, { useEffect, useRef, useState } from 'react'
import './WorkoutList.scss'
import { WorkoutDataType } from '../../types'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { getUniqueTitles, getWorkouts } from '../../services/tracker'
import { BsChevronCompactDown } from 'react-icons/bs'
import toast from 'react-hot-toast'
import { TailSpin } from 'react-loader-spinner'
import WorkoutItem from './WorkoutItem'

type WorkoutListProps = {
  workoutList: WorkoutDataType[]
  setWorkoutList: React.Dispatch<React.SetStateAction<WorkoutDataType[]>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  currWorkoutTitle: string
}

const WorkoutList = ({
  workoutList,
  setWorkoutList,
  setLoading,
  currWorkoutTitle,
}: WorkoutListProps) => {
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)
  const [isMoreData, setIsMoreData] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)
  const [nameFilter, setNameFilter] = useState<string | null>(null)
  const [workoutTitles, setWorkoutTitles] = useState<string[]>([])
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(true)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const scrollParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    getUniqueTitles('workoutTitles').then(res => {
      if (res) {
        setWorkoutTitles(res)
        getNextWorkouts(lastDoc)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (nameFilter !== null) {
      getNextWorkouts(null, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameFilter])

  const handleScroll = () => {
    if (titleRef?.current) {
      titleRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getNextWorkouts = (
    lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
    newQuery: boolean = false
  ) => {
    setMoreLoading(true)
    getWorkouts(15, lastDoc, nameFilter)
      .then(res => {
        if (res?.data) {
          const updatedWorkoutList = [...workoutList, ...res.data]
          if (newQuery) {
            setWorkoutList(res.data)
          } else {
            setWorkoutList(updatedWorkoutList)
          }
          setLastDoc(res.lastDoc)
          setIsMoreData(res.totalResults > updatedWorkoutList.length)
        }
        setLoading(false)
        setMoreLoading(false)
      })
      .catch((error: any) => {
        console.log(error)
        toast.error(error.message || error)
        setLoading(false)
        setMoreLoading(false)
      })
      .finally(() => {
        setIsFilterLoading(false)
      })
  }

  const handleSelectNameFilter = (title: string) => {
    setIsFilterLoading(true)
    setNameFilter(() => {
      if (nameFilter === title) return ''
      return title
    })
  }

  if (workoutList.length <= 0 && !nameFilter) return null

  return (
    <div className='workout-list-container' ref={scrollParentRef}>
      <button
        className='scroll-to-workouts-btn btn-no-styles'
        onClick={handleScroll}
      >
        Workouts{' '}
        <div className='icons'>
          <BsChevronCompactDown className='icon' />
          <BsChevronCompactDown className='icon' />
        </div>
      </button>
      <div className='title-content'>
        <h5 className='title' ref={titleRef}>
          Past Workouts
        </h5>

        <div className='workout-titles-list'>
          {workoutTitles.slice(0, 3).map(title => {
            return (
              <button
                key={title}
                className={`btn-no-styles ${
                  title === nameFilter ? 'active' : ''
                }`}
                onClick={() => handleSelectNameFilter(title)}
              >
                {title}
              </button>
            )
          })}
        </div>
      </div>
      <div
        className={`workout-list ${
          isFilterLoading ? 'workout-list-loading' : ''
        }`}
      >
        {workoutList.map(workout => (
          <WorkoutItem
            workout={workout}
            setWorkoutList={setWorkoutList}
            key={workout.id}
          />
        ))}
        {isMoreData && (
          <button
            className='btn-no-styles load-more'
            disabled={moreLoading}
            onClick={() => getNextWorkouts(lastDoc)}
          >
            {moreLoading ? (
              <TailSpin
                height='25'
                width='25'
                color='#303841'
                ariaLabel='loading'
              />
            ) : (
              'Load More'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default WorkoutList
