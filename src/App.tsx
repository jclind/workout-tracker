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
import Home from './Components/Pages/Home'
import { Route, Routes } from 'react-router-dom'
import Charts from './Components/Pages/Charts'
import Layout from './Components/Layout/Layout'
// import { findUniqueExerciseTitlesFromCollection } from './services/tracker'
// import { findUniqueWorkoutTitlesFromCollection } from './services/tracker'

Modal.setAppElement('#root')

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [loginLoading, setLoginLoading] = useState(false)

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true)

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
    if (user) {
      // findUniqueWorkoutTitlesFromCollection()
      // findUniqueExerciseTitlesFromCollection()
      // console.log('HERE')
    }
  }, [user])

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
        <Routes>
          <Route
            path='/'
            element={
              <Layout>
                <Home
                  user={user}
                  setShowLoadingOverlay={setShowLoadingOverlay}
                />
              </Layout>
            }
          />

          <Route
            path='/charts'
            element={
              <Layout>
                <Charts />
              </Layout>
            }
          />
        </Routes>
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
