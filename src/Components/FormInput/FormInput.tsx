import React, { useRef, useState } from 'react'
import './FormInput.scss'
import { AiFillCloseCircle } from 'react-icons/ai'

type FormInputProps = {
  val: string | number
  setVal: React.Dispatch<React.SetStateAction<string>>
  label: string
  LabelInfo?: React.ReactNode
  placeholder?: string
  inputID?: string
  onEnter?: (nextID: string | null) => void
  onBackspaceEmpty?: () => void
  nextID?: string | null
  inputRef?: React.RefObject<HTMLInputElement>
}

const FormInput = ({
  val,
  setVal,
  label,
  LabelInfo,
  placeholder,
  inputID,
  onEnter,
  onBackspaceEmpty,
  nextID = null,
  inputRef,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const faded = val && !isFocused

  // const focusInput = () => {
  //   if (inputRef.current) {
  //     console.log('test')
  //     inputRef.current.focus()
  //   }
  // }

  const handleClearInput = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('test')
    setVal('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter && e.key === 'Enter') {
      e.preventDefault()
      onEnter(nextID)
    } else if (!val && onBackspaceEmpty && e.key === 'Backspace') {
      e.preventDefault()
      onBackspaceEmpty()
    }
  }

  return (
    <div className='input-container'>
      <label className={faded ? 'fade' : ''}>
        {label}
        {LabelInfo && LabelInfo}
      </label>
      <div className='input'>
        <input
          type='text'
          value={val}
          className={faded ? 'fade' : ''}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          ref={inputRef}
          id={inputID}
        />
        {isFocused && val ? (
          <button
            className='btn-no-styles clear-btn'
            onMouseDown={handleClearInput}
          >
            <AiFillCloseCircle className='icon' />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default FormInput
