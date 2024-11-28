// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import Formulario from './Catalogo/Admin/componentes/Formulario';
// import Catalogo from './Catalogo/User/componentes/Catalogo';

// function App() {

//   return (
//     <>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Catalogo />} />
//           <Route path="/admin" element={<Formulario />} />

//         </Routes>
//       </Router>
//     </>
//   )
// }

// export default App



// === App.jsx ===
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Catalogo from './Catalogo/User/componentes/Catalogo';
import Login from './Catalogo/Admin/componentes/Login';
import Formulario from './Catalogo/Admin/componentes/Formulario';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('auth');
  return isAuth ? children : <Navigate to="/login" />;
}

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Catalogo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute><Formulario /></ProtectedRoute>} />
          </Routes>
      </Router>
  );
}

export default App;
