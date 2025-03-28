import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from './Button'
import Survey from './Survey'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Survey/>
    </>
  )
}
export default App
