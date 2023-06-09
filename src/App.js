import { Route, Routes } from 'react-router-dom'

import BaseLayout from './components/common/BaseLayout'
import HomePage from './pages/HomePage'
import StakingPage from './pages/StakingPage'
// import MarketplacePage from './pages/MarketplacePage'
// <Route path='/staking' element={<StakingPage />} />
// <Route path='/marketplace' element={<MarketplacePage />} />

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/staking' element={<StakingPage />} />
        </Route>
      </Routes>
      <ToastContainer
        position='top-center'
        autoClose={2000}
        hideProgressBar
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme='dark'
      />
    </div>
  )
}

export default App
