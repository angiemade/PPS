// === imagenesRoutes.js ===
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
});

// Obtener todas las imágenes
router.get("/get", (req, res) => {
    const directoryPath = path.join(__dirname, '../dbimages');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            res.status(500).send("Error al obtener las imágenes");
        } else {
            res.status(200).json(files);
        }
    });
});

// Subir una nueva imagen
router.post("/post", fileUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No se proporcionó ninguna imagen");
    }
    res.status(201).send("Imagen subida exitosamente");
});

// Editar una imagen existente
router.put("/edit/:id", fileUpload.single('image'), (req, res) => {
    const { id } = req.params;
    const directoryPath = path.join(__dirname, '../dbimages');
    const oldFileName = `${id}-pps-`;

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Error al acceder al directorio");
        }
        
        const oldFile = files.find(file => file.includes(oldFileName));
        if (oldFile) {
            fs.unlink(path.join(directoryPath, oldFile), (err) => {
                if (err) {
                    return res.status(500).send("Error al eliminar la imagen antigua");
                }
                // Nueva imagen
                if (req.file) {
                    res.status(201).send("Imagen editada exitosamente");
                }
            });
        }
    });
});

// Eliminar una imagen
router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;
    const directoryPath = path.join(__dirname, '../dbimages');
    const oldFileName = `${id}-pps-`;

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send("Error al acceder al directorio");
        }
        
        const oldFile = files.find(file => file.includes(oldFileName));
        if (oldFile) {
            fs.unlink(path.join(directoryPath, oldFile), (err) => {
                if (err) {
                    return res.status(500).send("Error al eliminar la imagen");
                }
                res.status(200).send("Imagen eliminada exitosamente");
            });
        } else {
            res.status(404).send("Imagen no encontrada");
        }
    });
});

module.exports = router;
