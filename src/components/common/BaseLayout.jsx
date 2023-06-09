import { Outlet } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'

const BaseLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-primary">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default BaseLayout
