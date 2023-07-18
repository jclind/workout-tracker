import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import './ViewAllExercisesModal.scss'
import { ExerciseDataType, ExercisesServerDataType } from '../../types'
import { queryAllSingleExercise } from '../../services/tracker'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { getDataFromExercise } from '../../util/getDataFromExercise'

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
    maxWidth: '80%',
  },
  overlay: {
    zIndex: '1000',
    background: 'rgba(0, 0, 0, 0.5)',
  },
}

type ViewAllExercisesModalProps = {
  exerciseName: string
}

const ViewAllExercisesModal = ({
  exerciseName,
}: ViewAllExercisesModalProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [data, setData] = useState<ExercisesServerDataType[]>([])

  const [lastQueryDoc, setLastQueryDoc] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null)

  useEffect(() => {
    queryData(10, null)
  }, [])

  const queryData = (
    resultsPerPage: number,
    lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
  ) => {
    if (exerciseName) {
      queryAllSingleExercise(exerciseName, resultsPerPage, lastDoc).then(
        res => {
          if (res) {
            setLastQueryDoc(res.lastDoc)
            setData(res.data)
          }
        }
      )
    }
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      // onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      // contentLabel='Example Modal'
    >
      <div className='view-all-exercises-content'>
        <h3>Previous {exerciseName} Data</h3>
        <div className='data'>
          {data.map(exercise => {
            return (
              <div className='single-exercise'>
                <h5>{exercise.workoutDate}</h5>
                <h4>{getDataFromExercise(exercise)}</h4>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default ViewAllExercisesModal
