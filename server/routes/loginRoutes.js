// === loginRoutes.js ===
const express = require('express');
const router = express.Router();

// Ruta para iniciar sesión
router.post('/', (req, res) => { // Cambiar la ruta a '/' para que coincida con la configuración en index.js
    const { password } = req.body;
    const db = req.db;

    // Verificar la contraseña
    db.query('SELECT * FROM usuarios WHERE username = ?', ['admin'], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length > 0 && results[0].password === password) {
            return res.status(200).send({ message: 'Autenticado correctamente' });
        } else {
            return res.status(401).send({ message: 'Contraseña incorrecta' });
        }
    });
});

module.exports = router;