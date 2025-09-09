import React from 'react'
import TestComponent from './components/TestComponent'

const AppTest: React.FC = () => {
  console.log('AppTest iniciado!')
  
  return (
    <div>
      <h1>App de Teste</h1>
      <TestComponent />
    </div>
  )
}

export default AppTest