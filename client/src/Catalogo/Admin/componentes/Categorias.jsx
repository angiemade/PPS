import { useState, useEffect } from 'react';
import Axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';

function CategoriasApp() {
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [editar, setEditar] = useState(false);
    const [idCategoria, setIdCategoria] = useState();
    const [desplegar, setDesplegar] = useState(false);

    // Obtener todas las categorías
    const getCategorias = () => {
        Axios.get("http://localhost:3001/categorias").then((response) => {
            setCategorias(response.data);
        });
    };

    useEffect(() => {
        getCategorias();
    }, []);

    // Agregar nueva categoría
    const addCategoria = () => {
        Axios.post("http://localhost:3001/categorias", {
            nombre: nombreCategoria,
        })
            .then(() => {
                getCategorias();
                setNombreCategoria("");
                Swal.fire({
                    title: "Categoría agregada",
                    icon: "success",
                    timer: 2000,
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.message,
                });
            });
    };

    // Editar categoría
    const editarCategoria = (categoria) => {
        setEditar(true);
        setNombreCategoria(categoria.nombre);
        setIdCategoria(categoria.id);
    };

    const putCategoria = () => {
        Axios.put(`http://localhost:3001/categorias/${idCategoria}`, {
            nombre: nombreCategoria,
        })
            .then(() => {
                getCategorias();
                setNombreCategoria("");
                setEditar(false);
                Swal.fire({
                    title: "Categoría modificada",
                    icon: "success",
                    timer: 2000,
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: error.message,
                });
            });
    };

    // Eliminar categoría
    const deleteCategoria = (id) => {
        Swal.fire({
            title: "Eliminar",
            text: `¿Desea eliminar esta categoría?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                Axios.delete(`http://localhost:3001/categorias/${id}`).then(() => {
                    getCategorias();
                    Swal.fire({
                        title: "Eliminada!",
                        text: "Categoría eliminada con éxito",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                });
            }
        });
    };

    return (
            <div className="container-fluid" style={{ padding: '20px', border: '1px solid #000', borderRadius: '40px 40px 40px 40px' }} >
                <div className="card " style={{ border: 'none', borderRadius: '15px', width: '100%' }}>
                    <h4 className="" style={{ border: '0px solid #000', color: '#000', fontWeight: 'bold', fontSize: '1.5rem' }}>
                        Agregar Categorias
                    </h4>
                    <div className="card-body d-flex justify-content-center">
                        <div className="input-group mb-3" style={{ width: '80%' }}>
                            <input
                                className="form-control"
                                type="text"
                                onChange={(event) => setNombreCategoria(event.target.value)}
                                placeholder="Escribe una categoría..."
                                value={nombreCategoria}
                                style={{ borderRadius: '10px 0 0 10px', border: '1px solid #000' }}
                            />
                            <button
                                className="btn btn-success"
                                onClick={editar ? putCategoria : addCategoria}
                                style={{  color: '#FFF', borderRadius: '0 10px 10px 0', fontWeight: 'bold', border: '1px solid #000' }}
                            >
                                {editar ? "Actualizar" : "Agregar"}
                            </button>
                        </div>
                    </div>
                    <div className=" text-body-secondary text-center" >
                        <button
                            className="btn text-center"
                            onClick={() => setDesplegar(!desplegar)}
                            style={{ backgroundColor: '#8e99a2', color: '#fff', border: '0px solid #000', borderRadius: '5px', fontWeight: 'bold' }}
                        >
                            {desplegar ? (
                                <><i className="bi bi-caret-up-fill"></i> Ocultar Categorías</>
                            ) : (
                                <><i className="bi bi-caret-down-fill"></i> Ver Categorías</>
                            )}
                        </button>
                    </div>
                </div>

                {desplegar && (
                    <div className="mt-3" style={{ width: '100%' }}>
                        <table className="table" style={{ backgroundColor: '#F7C1CA', borderRadius: '15px', overflow: 'hidden', width: '100%' }}>
                            <tbody>
                                {categorias.map((categoria, index) => (
                                    <tr key={categoria.id} style={{ color: '#000', fontWeight: 'bold', borderBottom: '1px solid #000' }}>
                                        <td style={{ padding: '15px', width: '70%' }}>{categoria.nombre}</td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="button"
                                                    onClick={() => editarCategoria(categoria)}
                                                    className="btn btn-warning"
                                                    style={{  border: '1px ', color: '#000', fontWeight: 'bold', borderRadius: '5px 0 0 5px' }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCategoria(categoria.id)}
                                                    className="btn btn-danger"
                                                    style={{  border: '1px ', color: '#fff', fontWeight: 'bold', borderRadius: '0 5px 5px 0' }}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

    );
}

export default CategoriasApp;