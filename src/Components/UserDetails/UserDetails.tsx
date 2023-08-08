import React, { useEffect, useState } from 'react'
import './UserDetails.scss'
import { auth } from '../../services/firestore'
import { AiOutlineUser } from 'react-icons/ai'
import {
  getNumberOfTotalExercises,
  getNumberOfTotalWorkouts,
} from '../../services/tracker'
import { formatDateToMMMDDYYYY } from '../../util/dateUtil'

const UserDetails = () => {
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(null)
  const [totalExercises, setTotalExercises] = useState<number | null>(null)

  const currUserAuth = auth.currentUser
  const displayName = currUserAuth?.displayName
  const profileURL = currUserAuth?.photoURL
  const dateJoined = currUserAuth?.metadata.creationTime
    ? new Date(currUserAuth?.metadata.creationTime)
    : null

  const handleRender = async () => {
    await getNumberOfTotalWorkouts().then(res => {
      if (res) {
        setTotalWorkouts(res)
      }
    })
    await getNumberOfTotalExercises().then(res => {
      if (res) {
        setTotalExercises(res)
      }
    })
  }

  useEffect(() => {
    handleRender()
  }, [])

  return (
    <div className='user-details'>
      <div className='profile-image-container'>
        {profileURL ? (
          <img
            src={profileURL}
            alt={displayName || 'profile'}
            className='profile-image'
          />
        ) : (
          <div className='profile-image'>
            <AiOutlineUser className='icon' />
          </div>
        )}
      </div>
      <h3 className='display-name'>{displayName}</h3>
      {dateJoined && (
        <div className='date-joined'>
          Joined {formatDateToMMMDDYYYY(dateJoined)}
        </div>
      )}
      <div className='small-data'>
        <div className='item'>
          <div className='value'>{totalWorkouts}</div>
          <div className='label'>Workouts</div>
        </div>
        <div className='item'>
          <div className='value'>{totalExercises}</div>
          <div className='label'>Exercises</div>
        </div>
      </div>
    </div>
  )
}

export default UserDetails
