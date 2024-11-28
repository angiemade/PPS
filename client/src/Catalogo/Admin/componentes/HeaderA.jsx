// === HeaderA.jsx ===
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LogoPequeta from '../imagenes/LogoPequeta.svg';

function HeaderA() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remover la autenticación del localStorage
        localStorage.removeItem('auth');
        // Navegar a la página de login
        navigate('/login');
    };

    return (
        <header className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid #ccc' }}>
            <div className="d-flex align-items-center">
                <img src={LogoPequeta} alt="Logo Pequeta" style={{ height: '40px', marginRight: '10px' }} />
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
                Cerrar Sesión <i className="bi bi-box-arrow-right"></i>
            </button>
        </header>
    );
}

export default HeaderA;
