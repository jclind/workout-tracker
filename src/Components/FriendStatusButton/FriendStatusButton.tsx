import React from 'react'
import './FriendStatusButton.scss'
import { FriendsStatusType } from '../../types'
import { acceptFriendRequest, addFriend } from '../../services/friends'
import toast from 'react-hot-toast'

const getBtnText = (friendshipStatus: FriendsStatusType): string => {
  if (friendshipStatus === 'not_friends') return 'add friend'
  else if (friendshipStatus === 'pending') return 'requested'
  else if (friendshipStatus === 'requested') return 'accept request'
  return friendshipStatus
}

type FriendStatusButtonProps = {
  friendshipStatus: FriendsStatusType
  setFriendshipStatus: React.Dispatch<
    React.SetStateAction<FriendsStatusType | null>
  >
  accountUsername: string
}
const FriendStatusButton = ({
  friendshipStatus,
  setFriendshipStatus,
  accountUsername,
}: FriendStatusButtonProps) => {
  const handleClick = () => {
    if (friendshipStatus === 'not_friends') {
      setFriendshipStatus('pending')
      addFriend(accountUsername).catch((err: any) => {
        toast.error(err, { position: 'bottom-center' })
        setFriendshipStatus('not_friends')
      })
    } else if (friendshipStatus === 'pending') {
    } else if (friendshipStatus === 'requested') {
      setFriendshipStatus('friends')
      acceptFriendRequest(accountUsername).catch((err: any) => {
        toast.error(err, { position: 'bottom-center' })
        setFriendshipStatus('requested')
      })
    }
  }

  return (
    <button className={`submit-btn ${friendshipStatus}`} onClick={handleClick}>
      {getBtnText(friendshipStatus)}
    </button>
  )
}

export default FriendStatusButton
