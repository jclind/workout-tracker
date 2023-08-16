import React from 'react'
import './UserDetails.scss'
import { AiOutlineUser } from 'react-icons/ai'

import { UserProfileDataType } from '../../types'

type UserDetailsProps = {
  userData: UserProfileDataType
}

const UserDetails = ({ userData }: UserDetailsProps) => {
  const {
    displayName,
    // createdAt,
    photoUrl,
    username,
    totalWorkouts,
    totalExercises,
  } = userData

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
