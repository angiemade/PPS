// === categoriasRoutes.js (Rutas para Categorías) ===
const express = require("express");
const router = express.Router();

// Conexión a la base de datos desde req
router.use((req, res, next) => {
  if (!req.db) {
    return res.status(500).send("La conexión a la base de datos no está disponible");
  }
  next();
});

// OBTENER TODAS LAS CATEGORÍAS
router.get("/", (req, res) => {
  const db = req.db;
  db.query("SELECT * FROM categorias", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(result);
    }
  });
});

// CREAR UNA CATEGORÍA
router.post("/", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).send("El nombre de la categoría es obligatorio");
  }
  const db = req.db;
  db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send("Categoría agregada");
    }
  });
});

// ACTUALIZAR UNA CATEGORÍA
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).send("El nombre de la categoría es obligatorio");
  }
  const db = req.db;
  db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Categoría actualizada");
    }
  });
});

// ELIMINAR UNA CATEGORÍA
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const db = req.db;
  db.query("DELETE FROM categorias WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Categoría eliminada");
    }
  });
});

module.exports = router;
