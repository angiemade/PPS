import '../estilos/formulario.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Categorias from './Categorias';

function Formulario() {
    const [file, setFile] = useState(null);
    const [productList, setProductList] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [cropper, setCropper] = useState(null);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);

    useEffect(() => {
        getCategorias();
        getProductos();
    }, []);

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

    const selectedHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result); // Actualizar la vista previa
                setFile(file); // Establecer el archivo para enviarlo
            };
            reader.readAsDataURL(file);
        }
    };

    const addProducto = () => {
        if (!cropper) {
            alert('Debes seleccionar y ajustar una imagen antes de agregar el producto');
            return;
        }

        cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob(blob => {
            const formdata = new FormData();
            formdata.append('image', blob, file.name);
            formdata.append('nombre', nombre);
            formdata.append('descripcion', descripcion);
            formdata.append('precio', precio);
            formdata.append('categoria_id', categoriaId);

            Axios.post("http://localhost:3001/productos/create", formdata)
                .then(() => {
                    getProductos();
                    limpiarCampos();
                    Swal.fire({
                        title: "Producto registrado",
                        icon: "success",
                        timer: 2000,
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se logró registrar el producto",
                    });
                });
        });
    };

    const editarProducto = (producto) => {
        setEditingProductId(producto.id);
        setNombre(producto.nombre);
        setDescripcion(producto.descripcion);
        setPrecio(producto.precio);
        setCategoriaId(producto.categoria_id);
        setImagePreview(producto.imagen);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const actualizarProducto = () => {
        if (cropper) {
            cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob(blob => {
                const formdata = new FormData();
                formdata.append('image', blob, file ? file.name : 'updated-image.jpg');
                formdata.append('id', editingProductId);
                formdata.append('nombre', nombre);
                formdata.append('descripcion', descripcion);
                formdata.append('precio', precio);
                formdata.append('categoria_id', categoriaId);
                continueUpdate(formdata);
            });
        } else {
            const formdata = new FormData();
            formdata.append('id', editingProductId);
            formdata.append('nombre', nombre);
            formdata.append('descripcion', descripcion);
            formdata.append('precio', precio);
            formdata.append('categoria_id', categoriaId);
            continueUpdate(formdata);
        }
    };

    const continueUpdate = (formdata) => {
        Axios.put("http://localhost:3001/productos/editar", formdata)
            .then(() => {
                getProductos();
                limpiarCampos();
                setTimeout(() => {
                    const updatedProduct = document.getElementById(`product-${editingProductId}`);
                    if (updatedProduct) {
                        updatedProduct.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 500);
                Swal.fire({
                    title: "Producto actualizado",
                    icon: "success",
                    timer: 2000,
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se logró actualizar el producto",
                });
            });
    };

    const limpiarCampos = () => {
        setNombre("");
        setDescripcion("");
        setPrecio("");
        setCategoriaId("");
        setImagePreview(null);
        setFile(null);
        setCropper(null);
        setEditingProductId(null);
    };

    const eliminarProducto = (productId) => {
        Swal.fire({
            title: "Eliminar",
            text: `¿Desea eliminar el producto?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
        }).then((result) => {
            if (result.isConfirmed) {
                Axios.delete(`http://localhost:3001/productos/eliminar/${productId}`)
                    .then((response) => {
                        if (response.status === 200) {
                            getProductos();
                            Swal.fire({
                                title: `Producto eliminado`,
                                icon: 'success',
                                timer: 3000
                            });
                        } else {
                            throw new Error('Error al eliminar el producto');
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No se logró eliminar el producto",
                            footer: error.message === "Network Error" ? "Intente más tarde" : error.message,
                        });
                    });
            }
        });
    };

    const subirSinImagen = () => {
        Swal.fire({
            title: "¿Quieres subir este producto sin una imagen?",
            text: "Se mostrará la imagen predeterminada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, subir sin imagen",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                const formdata = new FormData();
                formdata.append('nombre', nombre);
                formdata.append('descripcion', descripcion);
                formdata.append('precio', precio);
                formdata.append('categoria_id', categoriaId);

                Axios.post("http://localhost:3001/productos/create", formdata)
                    .then(() => {
                        getProductos();
                        limpiarCampos();
                        Swal.fire({
                            title: "Producto registrado sin imagen",
                            icon: "success",
                            timer: 2000,
                        });
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No se logró registrar el producto sin imagen (complete los campos requeridos)",
                        });
                    });
            }
        });
    };

    const actualizarSinImagen = () => {
        Swal.fire({
            title: "¿Quieres actualizar este producto sin una imagen?",
            text: "Se mostrará la imagen predeterminada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, actualizar sin imagen",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                const formdata = new FormData();
                formdata.append('id', editingProductId);
                formdata.append('nombre', nombre);
                formdata.append('descripcion', descripcion);
                formdata.append('precio', precio);
                formdata.append('categoria_id', categoriaId);

                Axios.put("http://localhost:3001/productos/editar", formdata)
                    .then(() => {
                        getProductos();
                        limpiarCampos();
                        Swal.fire({
                            title: "Producto actualizado sin imagen",
                            icon: "success",
                            timer: 2000,
                        });
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No se logró actualizar el producto sin imagen",
                        });
                    });
            }
        });
    };

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", backgroundColor: '#f8f9fa', padding: '40px 0' }}>
            <div className="container">
                <Categorias />
                <div className="card my-5 mx-auto" style={{ padding: '20px', border: '1px solid #000', borderRadius: '15px', maxWidth: '800px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <h3 className="card-title text-center mb-4" style={{ color: '#333', fontWeight: 'bold' }}>Agregar Nuevo Producto</h3>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4 mb-4">
                                <div
                                    className="card d-flex justify-content-center align-items-center"
                                    style={{
                                        height: '200px',
                                        width: '100%',
                                        backgroundColor: '#e9ecef',
                                        border: '2px dashed #ced4da',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                    }}
                                    onClick={() => !imagePreview && document.getElementById('fileinput').click()}
                                >
                                    {imagePreview ? (
                                        <Cropper
                                            src={imagePreview}
                                            style={{ height: "100%", width: "100%" }}
                                            aspectRatio={1}
                                            guides={false}
                                            viewMode={1}
                                            scalable={true}
                                            zoomable={true}
                                            cropBoxMovable={true}
                                            cropBoxResizable={true}
                                            onInitialized={(instance) => setCropper(instance)}
                                        />
                                    ) : (
                                        <span>Selecciona una Imagen</span>
                                    )}
                                    <input
                                        id="fileinput"
                                        type="file"
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={selectedHandler}
                                    />
                                </div>
                                {imagePreview && (
                                    <div className="mt-2 d-flex justify-content-center">
                                        <button
                                            className="btn btn-primary me-2"
                                            onClick={() => document.getElementById('fileinput').click()}
                                        >
                                            Cambiar Imagen
                                        </button>
                                        {!editingProductId && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => subirSinImagen()}
                                            >
                                                Sin Imagen
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-md-8">
                                <div className="form-group mb-3">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Nombre del Producto"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <input
                                        className="form-control"
                                        type="number"
                                        placeholder="Precio"
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Descripción"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <select
                                        className="form-control"
                                        value={categoriaId}
                                        onChange={(e) => setCategoriaId(e.target.value)}
                                    >
                                        <option value="">Seleccione una categoría</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-center">
                                    {editingProductId ? (
                                        <div>
                                            <button className="btn btn-warning me-2" onClick={actualizarProducto}>Actualizar Producto</button>
                                            <button
                                                className="btn btn-danger me-2"
                                                onClick={actualizarSinImagen}
                                            >
                                                Sin Imagen
                                            </button>
                                            <button className="btn btn-secondary" onClick={limpiarCampos}>Cancelar</button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-success"
                                            style={{ backgroundColor: '#28a745', color: '#fff', borderRadius: '10px', fontWeight: 'bold' }}
                                            onClick={addProducto}>Agregar Producto</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-5">
                    <h4 className="text-center" style={{ color: '#333', fontWeight: 'bold', fontSize: '1.5rem' }}>Productos Registrados</h4>
                    <div className="row justify-content-center">
                        {productList.map((product) => (
                            <div id={`product-${product.id}`} key={product.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                <div className="card h-100"
                                    style={{
                                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                        borderRadius: "15px",
                                    }}>
                                    <div className="card-body d-flex align-items-center">
                                        <div className="col-4">
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
                                                <button
                                                    className="btn btn-warning mt-2 me-2" style={{ fontWeight: 'bold' }}
                                                    onClick={() => editarProducto(product)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-danger mt-2" style={{ fontWeight: 'bold' }}
                                                    onClick={() => eliminarProducto(product.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Formulario;
