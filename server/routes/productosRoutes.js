// === productosRoutes.js (Rutas para Productos y Categorías) ===
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para la carga de archivos
const diskStorage = multer.diskStorage({
    destination: path.join(__dirname, '../dbimages'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-pps-' + file.originalname);
    }
});

const fileUpload = multer({
    storage: diskStorage
}).single('image');

// GUARDAR/CREAR PRODUCTO (incluyendo categoría y imagen)
router.post("/create", fileUpload, (req, res) => {
    const { nombre, descripcion, precio, categoria_id } = req.body;
    const db = req.db;

    if (req.file) {
        const tipo = req.file.mimetype;
        const nombreArchivo = req.file.originalname;
        const datos = fs.readFileSync(req.file.path);

        db.query('INSERT INTO foto SET ?', [{ tipo, nombre: nombreArchivo, datos }], (err, fotoResult) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error al guardar la imagen");
            } else {
                const imagen_id = fotoResult.insertId;

                db.query('INSERT INTO productos (nombre, descripcion, precio, imagen_id, categoria_id) VALUES (?, ?, ?, ?, ?)',
                    [nombre, descripcion, precio, imagen_id, categoria_id],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("Error al crear el producto");
                        } else {
                            res.send(result);
                        }
                    }
                );
            }
        });
    } else {
        // Si no se proporciona una imagen
        db.query('INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria_id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Error al crear el producto");
                } else {
                    res.send(result);
                }
            }
        );
    }
});
//esto es sin sacar la imagen cuando edito 
// // ACTUALIZAR/EDITAR PRODUCTO (incluyendo imagen)
// router.put("/editar", fileUpload, (req, res) => {
//     const { id, nombre, descripcion, precio, categoria_id } = req.body;
//     const db = req.db;

//     if (req.file) {
//         const tipo = req.file.mimetype;
//         const nombreArchivo = req.file.originalname;
//         const datos = fs.readFileSync(req.file.path);

//         // Primero insertar/actualizar la imagen
//         db.query('INSERT INTO foto SET ?', [{ tipo, nombre: nombreArchivo, datos }], (err, fotoResult) => {
//             if (err) {
//                 console.log(err);
//                 res.status(500).send("Error al actualizar la imagen");
//             } else {
//                 const imagen_id = fotoResult.insertId;

//                 db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen_id = ? WHERE id = ?',
//                     [nombre, descripcion, precio, categoria_id, imagen_id, id],
//                     (err, result) => {
//                         if (err) {
//                             console.log(err);
//                             res.status(500).send("Error al actualizar el producto");
//                         } else {
//                             res.send(result);
//                         }
//                     }
//                 );
//             }
//         });
//     } else {
//         // Si no se proporciona una nueva imagen, actualizar solo los datos del producto
//         db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?',
//             [nombre, descripcion, precio, categoria_id, id],
//             (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.status(500).send("Error al actualizar el producto");
//                 } else {
//                     res.send(result);
//                 }
//             }
//         );
//     }
// });


router.put("/editar", fileUpload, (req, res) => {
    const { id, nombre, descripcion, precio, categoria_id } = req.body;
    const db = req.db;
  
    if (req.file) {
      // Actualizar producto con una nueva imagen
      const tipo = req.file.mimetype;
      const nombreArchivo = req.file.originalname;
      const datos = fs.readFileSync(req.file.path);
  
      db.query('INSERT INTO foto SET ?', [{ tipo, nombre: nombreArchivo, datos }], (err, fotoResult) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error al actualizar la imagen");
        } else {
          const imagen_id = fotoResult.insertId;
  
          db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen_id = ? WHERE id = ?',
            [nombre, descripcion, precio, categoria_id, imagen_id, id],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send("Error al actualizar el producto");
              } else {
                res.send(result);
              }
            }
          );
        }
      });
    } else {
      // Actualizar producto sin imagen (asignar null para imagen_id)
      db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen_id = NULL WHERE id = ?',
        [nombre, descripcion, precio, categoria_id, id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error al actualizar el producto");
          } else {
            res.send(result);
          }
        }
      );
    }
  });
  









// LISTAR PRODUCTOS


router.get("/listar", (req, res) => {
    const db = req.db;

    const query = `
        SELECT 
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.categoria_id,
            f.nombre AS imagen
        FROM productos p
        LEFT JOIN foto f ON p.imagen_id = f.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.log("Error al obtener los productos:", err);
            res.status(500).send("Error al obtener los productos");
        } else {
            const products = results.map(product => ({
                id: product.id,
                nombre: product.nombre,
                descripcion: product.descripcion,
                precio: product.precio,
                categoria_id: product.categoria_id,
                imagen: product.imagen ? `http://localhost:3001/dbimages/${product.imagen}` : null
            }));
            res.status(200).json(products);
        }
    });
});


// ELIMINAR PRODUCTO
router.delete("/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const db = req.db;

    // Obtener el producto para acceder a la imagen asociada
    db.query('SELECT imagen_id FROM productos WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.log("Error al obtener la imagen del producto:", err);
            res.status(500).send("Error al eliminar el producto");
        } else if (result.length === 0) {
            res.status(404).send("Producto no encontrado");
        } else {
            const imagen_id = result[0].imagen_id;

            // Eliminar el producto primero
            db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
                if (err) {
                    console.log("Error al eliminar el producto:", err);
                    res.status(500).send("Error al eliminar el producto");
                } else if (result.affectedRows === 0) {
                    res.status(404).send("Producto no encontrado");
                } else {
                    // Si el producto se eliminó correctamente, eliminar la imagen asociada si existe
                    if (imagen_id) {
                        db.query('DELETE FROM foto WHERE id = ?', [imagen_id], (err) => {
                            if (err) {
                                console.log("Error al eliminar la imagen:", err);
                                res.status(500).send("Error al eliminar la imagen asociada");
                            } else {
                                res.status(200).send("Producto e imagen eliminados exitosamente");
                            }
                        });
                    } else {
                        res.status(200).send("Producto eliminado exitosamente");
                    }
                }
            });
        }
    });
});

module.exports = router; // Asegúrate de exportar el router
