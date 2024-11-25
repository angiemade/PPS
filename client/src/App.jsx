import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Formulario from './Catalogo/Admin/componentes/Formulario';

function App() {
 
  return (
    <>
       <Router>
            <Routes>
                <Route path="/" element={<Formulario/>} />
                {/* <Route path="/home" element={<Home/>} /> */}
                
            </Routes>
        </Router>
    </>
  )
}

export default App