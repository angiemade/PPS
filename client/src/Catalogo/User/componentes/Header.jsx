import React, { useEffect } from 'react';
import logo from '../imagenes/LogoPequeta.svg'; // Importa el logo desde la ruta especificada
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa estilos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa los íconos de Bootstrap

const Header = ({
    cartItems,
    setShowCart,
    categorias,
    selectedCategoria,
    setSelectedCategoria,
    searchTerm,
    setSearchTerm,
    showCategorias,
    setShowCategorias
}) => {
    useEffect(() => {
        const handleScroll = () => {
            const header = document.querySelector('.navbar-container');
            if (window.scrollY > 0) {
                header.style.position = 'fixed';
                header.style.top = '0';
                header.style.width = '100%';
                header.style.zIndex = '1000';
                header.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.position = 'relative';
                header.style.boxShadow = 'none';
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="navbar-container" >
            {/* Barra de navegación */}
            <nav className="navbar d-flex justify-content-between align-items-center mx-auto" >
                {/* Logo */}
                <div className="navbar-logo d-flex align-items-center">
                    <a href="/" className="navbar-brand d-flex align-items-center">
                        <img src={logo} alt="Logo" width="160" height="75" className="me-2" />
                    </a>
                </div>
                {/* Botón para mostrar categorías */}
                <div className="dropdown">
                    <button className="btn btn-pink dropdown-toggle" onClick={() => setShowCategorias(!showCategorias)}>
                         Ver categorías
                    </button>
                    {showCategorias && (
                        <div className="dropdown-menu show">
                            <button
                                className="dropdown-item"
                                onClick={() => setSelectedCategoria('')}
                            >
                                Todas las categorías
                            </button>
                            {categorias.map((categoria) => (
                                <button
                                    key={categoria.id}
                                    className="dropdown-item"
                                    onClick={() => setSelectedCategoria(categoria.id)}
                                >
                                    {categoria.nombre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* Barra de búsqueda */}
                <div className="navbar-search">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar"
                            aria-label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn input-group-text" onClick={() => alert('Buscando...')}>
                            <i className="bi bi-search-heart"></i>
                        </button>
                    </div>
                </div>
                {/* Botón del carrito */}
                <div className="navbar-cart d-flex align-items-center">
                    <button type="button" className="btn position-relative" onClick={() => setShowCart(true)}>
                        <i className="bi bi-cart3" style={{ fontSize: '1.5rem', color: '#8e99a2' }}></i>
                        {cartItems.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {cartItems.length} {/* Muestra el número de artículos en el carrito */}
                            </span>
                        )}
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Header;
