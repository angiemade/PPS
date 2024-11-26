import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Formulario from './Catalogo/Admin/componentes/Formulario';
import Catalogo from './Catalogo/User/componentes/Catalogo';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/admin" element={<Formulario />} />

        </Routes>
      </Router>
    </>
  )
}

export default App