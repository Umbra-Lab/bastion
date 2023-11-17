import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'
import './App.css'
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css"
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>,
)




