import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

function App() {
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
          imagen: product.imagen
            ? `http://localhost:3001/dbimages/${product.imagen}` // Si hay imagen, formar URL completa
            : "http://localhost:3001/dbimages/default.jpg",      // Si no hay imagen, usar la predeterminada
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

  // const editarProducto = (producto) => {
  //   setEditingProductId(producto.id);
  //   setNombre(producto.nombre);
  //   setDescripcion(producto.descripcion);
  //   setPrecio(producto.precio);
  //   setCategoriaId(producto.categoria_id);
  //   setImagePreview(
  //     producto.imagen
  //       ? producto.imagen // Si ya es una URL completa
  //       : "http://localhost:3001/dbimages/default.jpg" // Imagen predeterminada
  //   );
  //   // Desplazar hacia el formulario
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // };


  //me permite ajustar kas imagenes pero solo las default ahora ya que no muestra 
  const editarProducto = (producto) => {
    setEditingProductId(producto.id);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio);
    setCategoriaId(producto.categoria_id);

    // Cargar la imagen existente en el recortador
    setImagePreview(producto.imagen);

    // Desplazar hacia el formulario
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const actualizarProducto = () => {
    const formdata = new FormData();
    if (cropper && file) {
      cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob(blob => {
        formdata.append('image', blob, file.name);
        continueUpdate(formdata);
      });
    } else {
      continueUpdate(formdata);
    }
  };

  const continueUpdate = (formdata) => {
    formdata.append('id', editingProductId);
    formdata.append('nombre', nombre);
    formdata.append('descripcion', descripcion);
    formdata.append('precio', precio);
    formdata.append('categoria_id', categoriaId);

    Axios.put("http://localhost:3001/productos/editar", formdata)
      .then(() => {
        getProductos();
        limpiarCampos();

        // Esperar a que la lista de productos se actualice
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
    const editingProductElement = document.getElementById(`product-${editingProductId}`);

    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCategoriaId("");
    setImagePreview(null);
    setFile(null);
    setCropper(null);
    setEditingProductId(null);

    // Si estamos editando un producto, desplazar hacia él
    if (editingProductElement) {
      setTimeout(() => {
        editingProductElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200); // Pequeña espera para que React limpie el estado antes del scroll
    }
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


  return (
    <div className="container">
      <div className="card my-5">
        <div className="card-header">Agregar Nuevo Producto</div>
        <div className="card-body">
          <div className="row">






            <div className="col-md-4">
              <div
                className="card d-flex justify-content-center align-items-center"
                style={{
                  height: '200px',
                  width: '100%',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #ced4da',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
                onClick={() => !imagePreview && document.getElementById('fileinput').click()}
              >
                {imagePreview ? (
                  <Cropper
                    src={imagePreview}
                    style={{
                      height: "200px",
                      width: "100%"
                    }}
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

              {/* Botón para elegir otra imagen cuando se agrega un producto */}
              {!editingProductId && imagePreview && (
                <div className="mt-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => document.getElementById('fileinput').click()}
                  >
                    Elige otra imagen
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => subirSinImagen()}
                  >
                    Sin Imagen
                  </button>
                </div>
              )}

              {/* Botón para cambiar la imagen en modo edición */}
              {editingProductId && (
                <div className="mt-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => document.getElementById('fileinput').click()}
                  >
                    Cambiar Imagen
                  </button>
                </div>
              )}
            </div>









            <div className="col-md-8">
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nombre del Producto"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="number"
                  placeholder="Precio"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
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
              {editingProductId ? (
                <div>
                  <button className="btn btn-warning me-2" onClick={actualizarProducto}>Actualizar Producto</button>
                  <button className="btn btn-secondary" onClick={limpiarCampos}>Cancelar</button>
                </div>
              ) : (
                <button className="btn btn-success" onClick={addProducto}>Agregar Producto</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="my-5">
        <h4>Productos Registrados</h4>
        <div className="row">
          {productList.map((product) => (
            <div id={`product-${product.id}`} key={product.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="row no-gutters">
                  <div className="col-md-4">
                    <img
                      src={product.imagen}
                      className="card-img"
                      alt={product.nombre}
                      style={{
                        height: "200px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null; // Evita bucles infinitos de errores
                        e.target.src = "http://localhost:3001/dbimages/default.jpg"; // Imagen predeterminada
                      }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{product.nombre}</h5>
                      <p className="card-text">Precio: ${product.precio}</p>
                      <p className="card-text">{product.descripcion}</p>
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-warning"
                          onClick={() => editarProducto(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => eliminarProducto(product.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
