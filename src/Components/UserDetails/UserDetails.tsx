import React, { useEffect, useState } from 'react'
import './UserDetails.scss'
import { AiOutlineQrcode, AiOutlineUser } from 'react-icons/ai'

import { UserProfileDataType } from '../../types'
import { getNumberOfFriends } from '../../services/friends'
import FriendQRModal from '../FriendQRModal/FriendQRModal'

type UserDetailsProps = {
  userData: UserProfileDataType
}

const UserDetails = ({ userData }: UserDetailsProps) => {
  const [numFriends, setNumFriends] = useState<number | null>(null)
  const [isFriendQRModalOpen, setIsFriendQRModalOpen] = useState(false)
  const {
    displayName,
    // createdAt,
    photoUrl,
    username,
    totalWorkouts,
    totalExercises,
  } = userData

  useEffect(() => {
    getNumberOfFriends(username).then(res => {
      setNumFriends(res || 0)
    })
  }, [])

  return (
    <div className='user-details'>
      <button
        className='btn-no-styles profile-image-container'
        onClick={() => setIsFriendQRModalOpen(true)}
      >
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
        <div className='qr-code-link'>
          <AiOutlineQrcode className='icon' />
        </div>
      </button>
      <h3 className='display-name'>{displayName}</h3>
      <div className='username'>@{username}</div>
      <div className='small-data'>
        <div className='item'>
          <div className='value'>{numFriends}</div>
          <div className='label'>Friends</div>
        </div>
        <div className='item'>
          <div className='value'>{totalWorkouts}</div>
          <div className='label'>Workouts</div>
        </div>
        {/* <div className='item'>
          <div className='value'>{totalExercises}</div>
          <div className='label'>Exercises</div>
        </div> */}
      </div>
      <FriendQRModal
        isOpen={isFriendQRModalOpen}
        setIsOpen={setIsFriendQRModalOpen}
        name={displayName}
        username={username}
      />
    </div>
  )
}

export default UserDetails
