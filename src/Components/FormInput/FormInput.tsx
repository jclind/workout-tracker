import React, { useRef, useState } from 'react'
import './FormInput.scss'
import { AiFillCloseCircle } from 'react-icons/ai'

type FormInputProps = {
  val: string | number
  setVal: React.Dispatch<React.SetStateAction<string>>
  label: string
  LabelInfo?: React.ReactNode
  placeholder?: string
}

const FormInput = ({
  val,
  setVal,
  label,
  LabelInfo,
  placeholder,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const faded = val && !isFocused

  const inputRef = useRef<HTMLInputElement>(null)

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
          placeholder={placeholder}
          ref={inputRef}
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
