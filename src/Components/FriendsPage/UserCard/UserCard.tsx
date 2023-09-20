import React, { useState } from 'react'
import './UserCard.scss'
import { CombinedFriendsData } from '../../../types'
import {
  removeFriend,
  removeIncomingRequest,
  removeOutgoingRequest,
} from '../../../services/friends'
import { TailSpin } from 'react-loader-spinner'
import Skeleton from '@mui/material/Skeleton'
import styles from '../../../_exports.scss'
import { Link } from 'react-router-dom'
import { AiOutlineCheck } from 'react-icons/ai'

type UserDataType = CombinedFriendsData | null

type CardTypeProps = {
  user: UserDataType
  loading: boolean
  removeFromList: (uid: string) => void
}
const IncomingActions = ({ user, loading, removeFromList }: CardTypeProps) => {
  const [isFriends, setIsFriends] = useState(false)
  const [denyRequestLoading, setDenyRequestLoading] = useState(false)
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false)

  const handleDenyRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user) {
      setDenyRequestLoading(true)
      removeIncomingRequest(user.username).then(() => {
        setDenyRequestLoading(false)
      })
    }
  }
  const handleAcceptRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user) {
      setAcceptRequestLoading(true)
      setTimeout(() => {
        setAcceptRequestLoading(false)
        removeFromList(user.friendUID)
      }, 3000)
      // acceptFriendRequest(user.username).then(() => {

      // })
    }
  }

  const isBtnDisabled =
    loading || denyRequestLoading || acceptRequestLoading || !user

  return (
    <div className={`incoming-actions`}>
      <>
        {isFriends ? (
          <div className='friend-added-successfully'>
            <AiOutlineCheck /> Friend Added
          </div>
        ) : (
          <>
            {loading ? (
              <Skeleton
                sx={{ bgcolor: styles.tertiaryBackground }}
                variant='rounded'
                width={55}
                height={26}
              />
            ) : (
              <button
                className='no-styles-btn deny-btn'
                disabled={isBtnDisabled}
                onClick={handleDenyRequest}
              >
                {denyRequestLoading ? (
                  <TailSpin
                    height='25'
                    width='25'
                    color={styles.secondary}
                    ariaLabel='loading'
                  />
                ) : (
                  'Deny'
                )}
              </button>
            )}
            {loading ? (
              <Skeleton
                sx={{ bgcolor: styles.secondary }}
                variant='rounded'
                width={70}
                height={26}
              />
            ) : (
              <button
                className='no-styles-btn accept-btn'
                disabled={isBtnDisabled}
                onClick={handleAcceptRequest}
              >
                {acceptRequestLoading ? (
                  <TailSpin
                    height='25'
                    width='25'
                    color={styles.secondary}
                    ariaLabel='loading'
                  />
                ) : (
                  'Accept'
                )}
              </button>
            )}
          </>
        )}
      </>
    </div>
  )
}

const FriendActions = ({ user, loading, removeFromList }: CardTypeProps) => {
  const [removeFriendLoading, setRemoveFriendLoading] = useState(false)
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false)

  const [friendRemoved, setFriendRemoved] = useState(false)

  const handleRemoveFriendClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user) {
      setIsConfirmRemoveOpen(true)
    }
  }
  const handleCancelConfirm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user) {
      setIsConfirmRemoveOpen(false)
    }
  }
  const handleRemoveFriend = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user && removeFromList) {
      setRemoveFriendLoading(true)
      removeFriend(user.friendUID).then(() => {
        setRemoveFriendLoading(false)
        setFriendRemoved(true)
        removeFromList(user.friendUID)
      })
    }
  }

  const isBtnDisabled = loading || removeFriendLoading || !user

  return (
    <div className={`friends-actions`}>
      {friendRemoved ? (
        <div className='friend-removed-text'>
          <AiOutlineCheck />
          Removed
        </div>
      ) : isConfirmRemoveOpen ? (
        <>
          <button
            className='btn-no-styles cancel-remove-friend-btn'
            onClick={handleCancelConfirm}
            disabled={isBtnDisabled}
          >
            Cancel
          </button>
          <button
            className='btn-no-styles confirm-remove-friend-btn'
            onClick={handleRemoveFriend}
            disabled={isBtnDisabled}
          >
            {removeFriendLoading ? (
              <TailSpin
                height='25'
                width='25'
                color={styles.secondary}
                ariaLabel='loading'
              />
            ) : (
              'Confirm'
            )}
          </button>
        </>
      ) : (
        <button
          className='btn-no-styles remove-friend-btn'
          onClick={handleRemoveFriendClick}
          disabled={isBtnDisabled}
        >
          Remove
        </button>
      )}
    </div>
  )
}

const OutgoingActions = ({ user, loading, removeFromList }: CardTypeProps) => {
  const [removeRequestLoading, setRemoveRequestLoading] = useState(false)

  const isBtnDisabled = loading || !user || removeRequestLoading

  const handleRemoveRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (user) {
      setRemoveRequestLoading(true)

      removeOutgoingRequest(user.friendUID).then(() => {
        removeFromList(user.friendUID)
      })
    }
  }

  return (
    <div className='outgoing-actions'>
      {loading ? (
        <Skeleton
          sx={{ bgcolor: styles.tertiaryBackground }}
          variant='rounded'
          width={80}
          height={26}
        />
      ) : (
        <button
          className='no-styles-btn remove-btn'
          disabled={isBtnDisabled}
          onClick={handleRemoveRequest}
        >
          {removeRequestLoading ? (
            <TailSpin
              height='25'
              width='25'
              color={styles.secondary}
              ariaLabel='loading'
            />
          ) : (
            'Remove'
          )}
        </button>
      )}
    </div>
  )
}

type UserCardProps = {
  user: UserDataType
  type: 'incoming' | 'friend' | 'outgoing'
  removeFromList?: (uid: string) => void
  loading?: boolean
}
const UserCard = ({ user, type, loading, removeFromList }: UserCardProps) => {
  const userLink = user ? `/user/${user.username}` : ''

  const [itemRemoved, setItemRemoved] = useState(false)

  const handleRemoveFromList = (uid: string) => {
    setItemRemoved(true)
    setTimeout(() => {
      if (removeFromList) {
        removeFromList(uid)
      }
    }, 3000)
  }

  return (
    <Link
      to={userLink}
      className={`user-card ${!user ? 'disabled-link' : ''} ${
        itemRemoved ? 'removed' : ''
      }`}
    >
      <div className='profile-picture-container'>
        {loading || !user ? (
          <Skeleton
            sx={{ bgcolor: styles.tertiaryBackground }}
            variant='circular'
            width={'100%'}
            height={'100%'}
          />
        ) : (
          <img src={user.photoUrl} alt={user.displayName} />
        )}
      </div>
      <div className='user-info'>
        <div className='name'>
          {loading || !user ? (
            <Skeleton
              sx={{ bgcolor: styles.tertiaryBackground }}
              variant='rounded'
              width={120}
              height={14}
            />
          ) : (
            user.displayName
          )}
        </div>
        <div className='username'>
          {loading || !user ? (
            <Skeleton
              sx={{ bgcolor: styles.tertiaryBackground }}
              variant='rounded'
              width={120}
              height={10}
            />
          ) : (
            `(@${user.username})`
          )}
        </div>
      </div>
      <div className='actions'>
        {type === 'incoming' ? (
          <IncomingActions
            loading={!!loading}
            user={user}
            removeFromList={handleRemoveFromList}
          />
        ) : type === 'friend' ? (
          <FriendActions
            loading={!!loading}
            user={user}
            removeFromList={handleRemoveFromList}
          />
        ) : type === 'outgoing' ? (
          <OutgoingActions
            loading={!!loading}
            user={user}
            removeFromList={handleRemoveFromList}
          />
        ) : (
          ''
        )}
      </div>
    </Link>
  )
}

export default UserCard
