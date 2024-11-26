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
        const uniqueName = Date.now() + '-pps-' + file.originalname;
        cb(null, uniqueName);
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

        db.query('INSERT INTO foto SET ?', [{ tipo, nombre: req.file.filename, datos }], (err, fotoResult) => {
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


router.put("/editar", fileUpload, (req, res) => {
    const { id, nombre, descripcion, precio, categoria_id } = req.body;
    const db = req.db;

    // Consulta para obtener la información de la imagen anterior
    db.query('SELECT imagen_id, f.nombre AS imagen_nombre FROM productos p LEFT JOIN foto f ON p.imagen_id = f.id WHERE p.id = ?', [id], (err, result) => {
        if (err) {
            console.log("Error al obtener la imagen del producto:", err);
            return res.status(500).send("Error al actualizar el producto");
        }

        if (result.length > 0) {
            const imagen_id = result[0].imagen_id;
            const imagen_nombre = result[0].imagen_nombre;

            if (req.file) {
                // Actualizar producto con una nueva imagen
                const tipo = req.file.mimetype;
                const nombreArchivo = req.file.filename; // Nombre generado por Multer
                const datos = fs.readFileSync(req.file.path);

                // Eliminar imagen anterior del sistema de archivos si existe
                if (imagen_nombre) {
                    const oldImagePath = path.join(__dirname, '../dbimages', imagen_nombre);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }

                // Insertar la nueva imagen en la base de datos
                db.query('INSERT INTO foto SET ?', [{ tipo, nombre: nombreArchivo, datos }], (fotoErr, fotoResult) => {
                    if (fotoErr) {
                        console.log("Error al guardar la nueva imagen:", fotoErr);
                        return res.status(500).send("Error al actualizar la imagen");
                    }

                    const newImagenId = fotoResult.insertId;

                    // Actualizar el producto con la nueva imagen
                    db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen_id = ? WHERE id = ?',
                        [nombre, descripcion, precio, categoria_id, newImagenId, id],
                        (updateErr, updateResult) => {
                            if (updateErr) {
                                console.log("Error al actualizar el producto:", updateErr);
                                return res.status(500).send("Error al actualizar el producto");
                            }
                            res.send(updateResult);
                        }
                    );
                });
            } else {
                // Si no se proporciona una nueva imagen, mantener la imagen actual
                db.query('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?',
                    [nombre, descripcion, precio, categoria_id, id],
                    (updateErr, updateResult) => {
                        if (updateErr) {
                            console.log("Error al actualizar el producto:", updateErr);
                            return res.status(500).send("Error al actualizar el producto");
                        }
                        res.send(updateResult);
                    }
                );
            }
        } else {
            res.status(404).send("Producto no encontrado");
        }
    });
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
                imagen: product.imagen 
                    ? `http://localhost:3001/dbimages/${product.imagen}` 
                    : "http://localhost:3001/dbimages/default.jpg"
            }));
            res.status(200).json(products);
        }
    });
});

//ELIMINAR

// RUTA PARA LIMPIAR TODAS LAS IMÁGENES DE LA CARPETA Y ACTUALIZAR LA BASE DE DATOS
router.delete("/eliminar/:id", (req, res) => {
    const { id } = req.params;
    const db = req.db;

    // Obtener la información de la imagen del producto
    db.query('SELECT imagen_id, f.nombre AS imagen_nombre FROM productos p LEFT JOIN foto f ON p.imagen_id = f.id WHERE p.id = ?', [id], (err, result) => {
        if (err) {
            console.log("Error al obtener la imagen del producto:", err);
            return res.status(500).send("Error al obtener la información del producto");
        }

        if (result.length > 0) {
            const imagen_id = result[0].imagen_id;
            const imagen_nombre = result[0].imagen_nombre;

            // Eliminar el producto de la base de datos
            db.query('DELETE FROM productos WHERE id = ?', [id], (deleteProductoErr) => {
                if (deleteProductoErr) {
                    console.log("Error al eliminar el producto:", deleteProductoErr);
                    return res.status(500).send("Error al eliminar el producto");
                }

                // Eliminar la imagen del sistema de archivos si existe
                if (imagen_nombre) {
                    const imagePath = path.join(__dirname, '../dbimages', imagen_nombre);
                    if (fs.existsSync(imagePath)) {
                        fs.unlink(imagePath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.log("Error al eliminar la imagen del sistema de archivos:", unlinkErr);
                            }
                        });
                    }
                }

                // Eliminar el registro de la imagen de la base de datos
                if (imagen_id) {
                    db.query('DELETE FROM foto WHERE id = ?', [imagen_id], (deleteFotoErr) => {
                        if (deleteFotoErr) {
                            console.log("Error al eliminar la entrada de la tabla 'foto':", deleteFotoErr);
                        }
                    });
                }

                // Si todo ha sido exitoso, enviar una respuesta de éxito
                res.status(200).send("Producto eliminado correctamente");
            });
        } else {
            res.status(404).send("Producto no encontrado");
        }
    });
});



module.exports = router; // Asegúrate de exportar el router
