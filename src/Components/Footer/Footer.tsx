import React, { useState } from 'react'
import Modal from 'react-modal'
import './Footer.scss'
import { getTitleAndDate } from '../../util/getTitleAndDate'
import { parseExercise } from '../../util/parseExercise'
import { ExerciseDataType, WorkoutDataType } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import { importWorkouts } from '../../services/tracker'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#09090b',
    borderRadius: '5px',
    width: '400px',
    maxWidth: '80%',
  },
  overlay: {
    zIndex: '1000',
    background: 'rgba(0, 0, 0, 0.5)',
  },
}

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [importedText, setImportedText] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleImport = () => {
    setImportLoading(true)

    const workouts = importedText.split(/\n{2,}/)

    const formattedWorkouts: WorkoutDataType[] = []

    workouts.map(workoutString => {
      const workoutList = workoutString.split(/\n/)
      const { title, date } = getTitleAndDate(workoutList[0])
      const exercises: ExerciseDataType[] = []
      workoutList.slice(1).forEach(exercise => {
        const parsedExercise: ExerciseDataType = parseExercise(exercise)
        exercises.push(parsedExercise)
      })

      const workoutData: WorkoutDataType = {
        id: uuidv4(),
        name: title,
        date,
        exercises,
      }
      formattedWorkouts.push(workoutData)
    })

    importWorkouts(formattedWorkouts).then(() => {
      setImportLoading(false)
    })
  }

  return (
    <footer className='footer'>
      <button
        className='btn-no-styles import-btn'
        onClick={() => setIsModalOpen(true)}
      >
        import
      </button>
      <Modal
        isOpen={isModalOpen}
        // onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        // contentLabel='Example Modal'
      >
        <div className='import-modal-content'>
          <h3>Import Your Workout Data</h3>
          <textarea
            className='import-input'
            value={importedText}
            onChange={e => setImportedText(e.target.value)}
          ></textarea>
          {importLoading && 'Loading...'}
          <button className='submit-btn' onClick={handleImport}>
            Import
          </button>
        </div>
      </Modal>
    </footer>
  )
}

export default Footer
