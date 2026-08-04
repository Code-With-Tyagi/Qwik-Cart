import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/common/ScrollToTop'
import UserRoutes from './routes/UserRoutes'
import AdminRoutes from './routes/AdminRoutes'
import ProfileRoutes from './routes/ProfileRoutes'
import { checkAuth } from './features/auth.slice'
import { clearCart, getCart } from './features/cart.slice'

const AppBootstrapScreen = () => (
  <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      <p className="text-sm font-medium text-slate-600">Syncing your session...</p>
    </div>
  </div>
)

const App = () => {
  const dispatch = useDispatch()
  const [isBootstrapped, setIsBootstrapped] = useState(false)

  useEffect(() => {
    let isMounted = true

    const bootstrapApp = async () => {
      try {
        await dispatch(checkAuth()).unwrap()
        await dispatch(getCart()).unwrap()
      } catch {
        dispatch(clearCart())
      } finally {
        if (isMounted) {
          setIsBootstrapped(true)
        }
      }
    }

    bootstrapApp()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  if (!isBootstrapped) {
    return <AppBootstrapScreen />
  }

  return (
    <div>
      <ToastContainer />
      <ScrollToTop/>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/user/*" element={<ProfileRoutes />} />
      </Routes>
    </div>
  )
}

export default App
