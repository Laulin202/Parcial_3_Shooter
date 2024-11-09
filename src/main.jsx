import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {Canvas} from "@react-three/fiber";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div id="container">
      <div className='aim'></div>
      <Canvas camera={{ fov:45}} shadows>
        <App/>
      </Canvas>

    </div>
  </React.StrictMode>,
)
