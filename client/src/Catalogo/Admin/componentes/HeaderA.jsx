// === HeaderA.jsx ===
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LogoPequeta from '../imagenes/LogoPequeta.svg';

function HeaderA() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const header = document.querySelector('.navbar-container');
            if (window.scrollY > 0) {
                header.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        // Remover la autenticación del localStorage
        localStorage.removeItem('auth');
        // Navegar a la página de login
        navigate('/login');
    };

    return (
        <div className="navbar-container p-0 m-0">
            <nav className="navbar d-flex justify-content-between align-items-center px-4 py-3"
                 style={{
                    width: '100%',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    backgroundColor: '#fff',
                    zIndex: '1000',
                    height: '80px' // Asegurarse de que la altura esté especificada claramente
                 }}>
                {/* Logo */}
                <div className="navbar-logo d-flex align-items-center">
                    <a href="/admin" className="navbar-brand d-flex align-items-center">
                        <img src={LogoPequeta} alt="Logo" style={{ height: '50px' }} className="me-2" />
                    </a>
                </div>

                {/* Botón de cerrar sesión */}
                <button className="btn btn-secondary d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="d-none d-md-inline ms-2">Cerrar Sesión</span>
                </button>
            </nav>
        </div>
    );
}

export default HeaderA;
