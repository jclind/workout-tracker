import React, { useState, useRef } from 'react'
import { calculateInputWidth } from '../../util/calculateInputWidth'

type WorkoutTitleProps = {
  title: string
  handleUpdateTitle: (updatedTitle: string) => void
}

const WorkoutTitle = ({ title, handleUpdateTitle }: WorkoutTitleProps) => {
  const [editedStr, setEditedStr] = useState(title)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!editedStr.trim()) {
      setEditedStr(title)
    } else if (editedStr.trim() !== title) {
      handleUpdateTitle(editedStr.trim())
    }
  }

  return (
    <input
      className={`workout-title ${isFocused ? 'focused' : 'blurred'}`}
      value={editedStr}
      onChange={e => {
        setEditedStr(e.target.value)
      }}
      onFocus={e => {
        setIsFocused(true)
        e.target.select()
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={inputRef}
      style={{ width: calculateInputWidth(editedStr, 'Nunito', 10) }}
      // style={{ width: `${editedStr.length}ch` }}
    />
    // <h3 className='workout-title'>{title}</h3>
  )
}

export default WorkoutTitle
