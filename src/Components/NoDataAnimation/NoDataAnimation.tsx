import React from 'react'
import Lottie from 'lottie-react'
import noDataAnimationJSON from '../../assets/animations/no-data-animation.json'
import noDataAnimationJSON2 from '../../assets/animations/no-data-animation-2.json'
import './NoDataAnimation.scss'

const NoDataAnimation = () => {
  return (
    <div className='no-data-animation-container'>
      <div className='animation'>
        <Lottie animationData={noDataAnimationJSON2} />
      </div>
    </div>
  )
}

export default NoDataAnimation
