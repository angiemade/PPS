// === Index.js (Configuración Principal del Servidor) ===
const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "PPS"
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos exitosa.');
    }
});

app.use((req, res, next) => {
    req.db = db; // Asignar la conexión db a req para que pueda ser utilizada en las rutas
    next();
});

// Configuración para servir archivos estáticos desde la carpeta 'dbimages'
app.use('/dbimages', express.static(path.join(__dirname, 'dbimages')));

// Rutas del servidor
app.use('/imagenes', require('./routes/imagenesRoutes'));
app.use('/categorias', require('./routes/categoriasRoutes'));
app.use('/productos', require('./routes/productosRoutes')); // Nueva ruta de productos
app.use('/login', require('./routes/loginRoutes')); // La ruta coincide con el nombre del archivo (todo en minúsculas)

app.listen(3001, () => {
    console.log('Servidor corriendo en', 'http://localhost:' + 3001);
});
