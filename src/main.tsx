import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.tsx'
import DevSubmissions from './pages/DevSubmissions.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/dev/submissions', element: <DevSubmissions /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
