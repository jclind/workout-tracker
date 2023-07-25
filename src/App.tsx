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
import { Toaster } from 'react-hot-toast'

Modal.setAppElement('#root')

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)

  const [workoutList, setWorkoutList] = useState<WorkoutDataType[]>([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userInstance => {
      if (userInstance) {
        setUser(userInstance)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className='App'>
        <h5>loading...</h5>
      </div>
    )
  }

  const handleSignup = () => {
    setLoginLoading(true)
    signupWithGoogle()
      .then(() => {
        setLoginLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoginLoading(false)
      })
  }

  return (
    <div className='App'>
      <Toaster />
      {user ? (
        <>
          <Nav />
          <ExerciseList setWorkoutList={setWorkoutList} />
          <WorkoutList
            workoutList={workoutList}
            setWorkoutList={setWorkoutList}
          />
          <Footer />
        </>
      ) : (
        <div className='login-container'>
          <h1>Workout Tracker</h1>
          {loginLoading && 'auth loading...'}
          <button
            className='btn-no-styles google-signup-btn'
            onClick={handleSignup}
          >
            <AiFillGoogleCircle className='icon' /> Sign In With Google
          </button>
        </div>
      )}

      {/* <Autocomplete
        disablePortal
        id='combo-box-demo'
        options={top100Films}
        sx={{ width: 300 }}
        renderInput={params => <TextField {...params} label='Workout Title' />}
      /> */}
    </div>
  )
}

export default App
