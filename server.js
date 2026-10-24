const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Aiven: los datos vienen de variables de entorno (no van en el código)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
});

// Probar que la API está viva
app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

// Listar todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT * FROM usuarios");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver un usuario por id
app.get("/usuarios/:id", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
      req.params.id,
    ]);
    if (filas.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar un usuario
app.post("/usuarios", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre" });
  }
  try {
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre) VALUES (?)",
      [nombre]
    );
    res.status(201).json({ id: resultado.insertId, nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API escuchando en el puerto " + PORT));
