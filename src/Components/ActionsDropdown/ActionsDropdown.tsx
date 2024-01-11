import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineEllipsis } from 'react-icons/ai'

import './ActionsDropdown.scss'

const useOutsideAlerter = (
  ref: React.RefObject<HTMLDivElement>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}

type ActionsDropdownProps = {
  buttons: {
    text: string
    icon: JSX.Element
    type?: 'default' | 'danger'
    action: () => void
  }[]
}

const ActionsDropdown = ({ buttons }: ActionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  useOutsideAlerter(wrapperRef, setIsOpen)

  const handleToggleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }

  return (
    <div className='actions-dropdown-container' ref={wrapperRef}>
      <button className='trigger btn-no-styles' onClick={handleToggleClick}>
        <AiOutlineEllipsis className='icon' />
      </button>
      {isOpen && (
        <div className='dropdown'>
          {buttons.map(item => {
            return (
              <button
                key={item.text}
                className={`item btn-no-styles ${item.type ? item.type : ''}`}
                onClick={item.action}
              >
                {item.icon}
                <div className='text'>{item.text}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActionsDropdown
