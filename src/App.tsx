import { createContext, useContext, useEffect, useState } from 'react'
import Modal from 'react-modal'
import { auth } from './services/firestore'
import { AiFillGoogleCircle } from 'react-icons/ai'
import { getUsername, signupWithGoogle } from './services/auth'
import { User } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import Lottie from 'lottie-react'
import loadingAnimationData from './assets/animations/page-loading.json'
import Home from './Pages/Home'
import { Route, Routes } from 'react-router-dom'
import Charts from './Pages/Charts/Charts'
import Layout from './Components/Layout/Layout'
import Account from './Pages/Account/Account'
// import { updateUsersData } from './services/tracker'
// import { findUniqueExerciseTitlesFromCollection } from './services/tracker'
// import { findUniqueWorkoutTitlesFromCollection } from './services/tracker'

Modal.setAppElement('#root')

const UsernameContext = createContext<{ username: string | null }>({
  username: null,
})
export const useUsername = () => {
  return useContext(UsernameContext)
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
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
      // addUsersData()
      // findUniqueWorkoutTitlesFromCollection()
      // findUniqueExerciseTitlesFromCollection()
      // console.log('HERE')
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userInstance => {
      if (userInstance) {
        getUsername().then(res => {
          if (res) {
            setUsername(res)
          }
          setUser(userInstance)
        })
      } else {
        setUser(null)
        setUsername(null)
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
    <UsernameContext.Provider value={{ username }}>
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
              path='/user/:username'
              element={
                <Layout>
                  <Account />
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
    </UsernameContext.Provider>
  )
}

export default App
