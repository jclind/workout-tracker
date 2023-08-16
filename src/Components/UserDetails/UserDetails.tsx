import React, { useEffect, useState } from 'react'
import './UserDetails.scss'
import { AiOutlineUser } from 'react-icons/ai'
import {
  getNumberOfTotalExercises,
  getNumberOfTotalWorkouts,
} from '../../services/tracker'
import { formatDateToMMMDDYYYY } from '../../util/dateUtil'
import { UserProfileDataType } from '../../types'

type UserDetailsProps = {
  userData: UserProfileDataType
}

const UserDetails = ({ userData }: UserDetailsProps) => {
  const [totalWorkouts, setTotalWorkouts] = useState<number | null>(null)
  const [totalExercises, setTotalExercises] = useState<number | null>(null)

  const { displayName, createdAt, photoUrl, username } = userData
  console.log(photoUrl)
  const dateJoined = new Date(createdAt)

  const handleRender = async () => {}

  useEffect(() => {
    handleRender()
  }, [])

  return (
    <div className='user-details'>
      <div className='profile-image-container'>
        {photoUrl ? (
          <img
            src={photoUrl}
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
      <div className='username'>@{username}</div>
      {/* {dateJoined && (
        <div className='date-joined'>
          Joined {formatDateToMMMDDYYYY(dateJoined)}
        </div>
      )} */}
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
