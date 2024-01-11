import React, { useState, useRef } from 'react'
import TextareaAutosize from '@mui/base/TextareaAutosize'
import { ExerciseDataType } from '../../types'

type ExerciseItemProps = {
  exercise: ExerciseDataType
  handleUpdateExercise: (
    exerciseID: string,
    updatedExerciseStr: string,
    originalExerciseStr: string
  ) => void
  handleEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}
const ExerciseItem = ({
  exercise,
  handleUpdateExercise,
  handleEnter,
}: ExerciseItemProps) => {
  const [editedStr, setEditedStr] = useState(exercise.originalString)
  const [isFocused, setIsFocused] = useState(false)
  const [prevTitle, setPrevTitle] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (textareaRef.current) {
        textareaRef.current.blur()
      }
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setPrevTitle(editedStr)
  }
  const handleBlur = () => {
    setIsFocused(false)
    if (!editedStr.trim()) {
      setEditedStr(exercise.originalString)
    } else if (editedStr.trim() !== exercise.originalString) {
      handleUpdateExercise(exercise.id, editedStr.trim(), prevTitle)
    }
  }

  return (
    <TextareaAutosize
      className={`exercise ${isFocused ? 'focused' : 'blurred'}`}
      value={editedStr}
      onChange={e => setEditedStr(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={textareaRef}
      key={exercise.id}
      onKeyDownCapture={e => handleEnter(e)}
    />
  )
}

export default ExerciseItem
