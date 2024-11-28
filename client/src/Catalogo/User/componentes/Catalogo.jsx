import React, { useState, useEffect } from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa estilos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa los íconos de Bootstrap
import Swal from 'sweetalert2';
import Axios from 'axios';
import '../estilos/catalogo.css'; // Importa los estilos personalizados

const Catalogo = () => {
    // Estado para manejar los artículos en el carrito
    const [cartItems, setCartItems] = useState([]);
    // Estado para controlar la visibilidad del carrito
    const [showCart, setShowCart] = useState(false);
    // Estado para calcular el total del carrito
    const [total, setTotal] = useState(0);
    // Estado para la lista de productos
    const [productList, setProductList] = useState([]);
    // Estado para la lista de categorías
    const [categorias, setCategorias] = useState([]);
    // Estado para la categoría seleccionada
    const [selectedCategoria, setSelectedCategoria] = useState('');
    // Estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para mostrar u ocultar las categorías
    const [showCategorias, setShowCategorias] = useState(false);

    // Función para obtener los productos desde el backend
    useEffect(() => {
        getProductos();
        getCategorias();
    }, []);

    const getProductos = () => {
        Axios.get("http://localhost:3001/productos/listar")
            .then((response) => {
                const products = response.data.map(product => ({
                    ...product,
                    imagen: product.imagen ? product.imagen : "http://localhost:3001/dbimages/default.jpg"
                }));
                setProductList(products);
            })
            .catch((error) => {
                console.error("Error al obtener los productos", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al obtener los productos. Verifique el servidor.",
                });
            });
    };

    const getCategorias = () => {
        Axios.get("http://localhost:3001/categorias")
            .then((response) => {
                setCategorias(response.data);
            })
            .catch((error) => {
                console.error("Error al obtener las categorías", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al obtener las categorías. Verifique el servidor.",
                });
            });
    };

    // Función para agregar un producto al carrito
    const addToCart = (product) => {
        const existingProduct = cartItems.find(item => item.nombre === product.nombre);
        if (existingProduct) {
            // Si el producto ya está en el carrito, incrementa su cantidad
            setCartItems(cartItems.map(item =>
                item.nombre === product.nombre ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            // Si no está en el carrito, agrégalo con cantidad 1
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    // Incrementa la cantidad de un producto en el carrito
    const incrementQuantity = (productName) => {
        setCartItems(cartItems.map(item =>
            item.nombre === productName ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    // Disminuye la cantidad de un producto en el carrito
    const decrementQuantity = (productName) => {
        setCartItems(cartItems.map(item =>
            item.nombre === productName && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        ));
    };

    // Elimina un producto del carrito
    const removeFromCart = (productName) => {
        setCartItems(cartItems.filter(item => item.nombre !== productName));
    };

    // Calcula el total del carrito cuando cambian los artículos
    useEffect(() => {
        setTotal(cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0));
    }, [cartItems]);

    // Genera el mensaje para WhatsApp con los detalles del carrito
    const generateWhatsAppMessage = () => {
        let message = "Hola, me gustaría realizar la siguiente compra:\n\n";
        cartItems.forEach(item => {
            message += `Producto: ${item.nombre}\nCantidad: ${item.quantity}\nSubtotal: $${(item.precio * item.quantity).toLocaleString()}\n\n`;
        });
        message += `Total: $${total.toLocaleString()}\n\nGracias.`;
        return encodeURIComponent(message); // Codifica el mensaje para usarlo en la URL
    };

    // Filtra los productos según la categoría seleccionada y el término de búsqueda
    const filteredProducts = productList.filter(product => {
        return (
            (selectedCategoria === '' || product.categoria_id === selectedCategoria) &&
            (searchTerm === '' || product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <div >
            <Header
                cartItems={cartItems}
                setShowCart={setShowCart}
                categorias={categorias}
                selectedCategoria={selectedCategoria}
                setSelectedCategoria={setSelectedCategoria}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showCategorias={showCategorias}
                setShowCategorias={setShowCategorias}
            />
            {/* Catálogo de productos */}
            <div className="container mt-5" >
                <div className="row justify-content-center">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                            <div className="card h-100"
                                style={{
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    borderRadius: "15px",
                                    background:"#f3dee2" //color de las card 
                                }}>
                                <div className="card-body d-flex align-items-center"  >
                                    <div className="col-4" >
                                        <img
                                            src={product.imagen}
                                            className="card-img"
                                            alt={product.nombre}
                                            style={{
                                                height: "100%",
                                                width: "100%",
                                                objectFit: "cover",
                                                borderRadius: '10px',
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "http://localhost:3001/dbimages/default.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body">
                                            <h5 className="card-title">{product.nombre}</h5>
                                            <p className="card-text">{product.descripcion}</p>
                                            <p className="card-text fw-bold">${product.precio}</p>
                                            <button className="btn custom-add-to-cart-btn" onClick={() => addToCart(product)}>
                                                Agregar al Carrito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Modal del carrito */}
            {showCart && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-white">
                                <h5 className="modal-title">Carrito de Compras</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCart(false)}></button>
                            </div>
                            <div className="modal-body bg-white">
                                {cartItems.length === 0 ? (
                                    <p>El carrito está vacío</p>
                                ) : (
                                    <div>
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                                <div>
                                                    <h6>{item.nombre}</h6>
                                                    <p>Cantidad: {item.quantity}</p>
                                                    <p>Total: ${(item.precio * item.quantity).toLocaleString()}</p>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <button className="btn btn-light btn-sm" onClick={() => decrementQuantity(item.nombre)}>-</button>
                                                    <button className="btn btn-light btn-sm mx-2" onClick={() => incrementQuantity(item.nombre)}>+</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.nombre)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-white">
                                <h5>Total: ${total.toLocaleString()}</h5>
                                <button type="button" className="btn custom-add-to-cart-btn" onClick={() => setCartItems([])}>Vaciar</button>
                                <a
                                    href={`https://wa.me/3816764784?text=${generateWhatsAppMessage()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn custom-add-to-cart-btn"
                                >
                                    Comprar
                                </a>
                                <button type="button" className="btn btn-dark" onClick={() => setShowCart(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Catalogo;
