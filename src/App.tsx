import React, { useEffect, useState } from 'react'
import ExerciseList from './Components/ExerciseList/ExerciseList'
import Modal from 'react-modal'
import { auth } from './services/firestore'
import { AiFillGoogleCircle } from 'react-icons/ai'
import { signupWithGoogle } from './services/auth'
import { User } from 'firebase/auth'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import WorkoutList from './Components/WorkoutList/WorkoutList'
import { WorkoutDataType } from './types'
import toast, { Toaster } from 'react-hot-toast'
import Lottie from 'lottie-react'
import loadingAnimationData from './assets/animations/page-loading.json'

Modal.setAppElement('#root')

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [exerciseListLoading, setExerciseListLoading] = useState(true)
  const [workoutListLoading, setWorkoutListLoading] = useState(true)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  const [workoutList, setWorkoutList] = useState<WorkoutDataType[]>([])

  useEffect(() => {
    if (!user && (exerciseListLoading || workoutListLoading)) {
      setShowLoadingOverlay(true)
    } else {
      setTimeout(() => {
        setShowLoadingOverlay(false)
      }, 300)
    }
  }, [user, exerciseListLoading, workoutListLoading])
  useEffect(() => {
    if (authLoading || loginLoading) {
      setShowLoadingOverlay(true)
    } else {
      setTimeout(() => {
        setShowLoadingOverlay(false)
      }, 100)
    }
  }, [authLoading, loginLoading])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userInstance => {
      if (userInstance) {
        setUser(userInstance)
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignup = () => {
    setLoginLoading(true)
    signupWithGoogle()
      .then(() => {
        setLoginLoading(false)
      })
      .catch(err => {
        toast.error(err, { position: 'bottom-center' })
        setLoginLoading(false)
      })
  }

  return (
    <div className='App'>
      <div
        className={`loading-overlay ${
          showLoadingOverlay ? 'visible' : 'hidden'
        }`}
      >
        <div className='animation'>
          <Lottie animationData={loadingAnimationData} />
        </div>
      </div>
      <Toaster />
      {user ? (
        <>
          <Nav />
          <ExerciseList
            setWorkoutList={setWorkoutList}
            loading={exerciseListLoading}
            setLoading={setExerciseListLoading}
          />
          <WorkoutList
            workoutList={workoutList}
            setWorkoutList={setWorkoutList}
            loading={workoutListLoading}
            setLoading={setWorkoutListLoading}
          />
          <Footer setWorkoutList={setWorkoutList} />
        </>
      ) : (
        <div className='login-container'>
          <h1>Workout Tracker</h1>
          <button
            className='btn-no-styles google-signup-btn'
            onClick={handleSignup}
          >
            <AiFillGoogleCircle className='icon' /> Sign In With Google
          </button>
        </div>
      )}
    </div>
  )
}

export default App
