// Importamos express y fs/promises para manipular archivos JSON
import express from 'express'; // Importa el framework Express para crear un servidor HTTP y definir rutas.
import fs from 'fs/promises';  // Importa la API de archivos de Node basada en promesas (readFile, writeFile, etc.).

// Ruta del archivo que guarda los clientes
const archivoClientes = './data/clientes.json'; // Ruta relativa al JSON que persiste la lista de clientes.

// Creamos el servidor con Express
const app = express();        // Crea una instancia de aplicación Express (nuestro servidor).
const PORT = 3000;            // Define el puerto donde escuchará el servidor.

// Middleware para procesar JSON en las solicitudes
app.use(express.json());   // Middleware que parsea automáticamente el cuerpo (body) de las requests como JSON.

/** * Leer clientes desde el archivo JSON */
const leerClientes = async () => {              // Declara una función asíncrona para leer el archivo de clientes.
  const data = await fs.readFile(archivoClientes, 'utf-8');     // Lee el archivo como texto (string) en codificación UTF-8.
  return JSON.parse(data);                      // Convierte el string a objeto/array JS (parseo de JSON) y lo retorna.
};                                                                 // Fin de la función leerClientes.

/*** Guardar la lista actualizada de clientes en el archivo JSON */
const guardarClientes = async (clientes) => {                      // Declara una función asíncrona que recibe el array de clientes actualizado.
  await fs.writeFile(archivoClientes, JSON.stringify(clientes, null, 2)); // Escribe el array como JSON “bonito” (indentado a 2 espacios).
};                                                                 // Fin de la función guardarClientes.

/** * GET /clientes - Devolver todos los clientes */
app.get('/clientes', async (req, res) => {                         // Define la ruta GET /clientes; req = pedido del cliente, res = respuesta.
  try {                                                            // Intenta ejecutar el bloque que podría fallar.
    const clientes = await leerClientes();                       // Lee el listado de clientes desde el archivo.
    res.json(clientes);                                    // Responde al cliente con el array de clientes en formato JSON.
  } catch (error) {                                         // Si algo falla en el try...
    res.status(500).json({ error: 'Error al leer los datos.' });  // Devuelve HTTP 500 (error del servidor) con un mensaje JSON.
  }                                                                // Fin del catch.
});                                                                // Fin del handler GET /clientes.

/** * POST /clientes - Crear un nuevo cliente */
app.post('/clientes', async (req, res) => {               // Define la ruta POST /clientes para crear un cliente nuevo.
  try {                                                            // Intenta ejecutar el bloque de creación.
    const clientes = await leerClientes();// Obtiene la lista actual de clientes.
    const nuevoCliente = req.body;           // Toma el cuerpo de la solicitud (JSON enviado por el cliente).

    // Validación básica
    if (!nuevoCliente.nombre) {// Verifica que exista el campo obligatorio 'nombre'.
      return res.status(400).json({ error: "Falta el campo 'nombre'" }); // Si falta, responde 400 (bad request) y corta la ejecución.
    }
    // Asignamos un nuevo ID secuencial
    nuevoCliente.id = clientes.length > 0 ? clientes.at(-1).id + 1 : 1; // Si hay clientes, usa el último id + 1; si no, arranca en 1.

    // Agregamos el nuevo cliente al array
    clientes.push(nuevoCliente);// Inserta el nuevo cliente en la lista en memoria.
    await guardarClientes(clientes);// Persiste la lista actualizada escribiendo el archivo JSON.

    res.status(201).json(nuevoCliente);// Responde 201 (creado) y devuelve el nuevo cliente en JSON.
  } catch (error) {// Si algo falla durante la creación/guardado...
    res.status(500).json({ error: 'Error al guardar el cliente.' });// Responde 500 (error del servidor) con un mensaje JSON.
  }                                                                // Fin del catch.
});                                                               // Fin del handler POST /clientes.

/** * DELETE /clientes/:id - Eliminar un cliente por su ID */
app.delete('/clientes/:id', async (req, res) => {                  // Define la ruta DELETE con parámetro de ruta :id.
  try {// Intenta ejecutar el bloque que podría fallar.
    const id = parseInt(req.params.id);                            // Convierte el parámetro de ruta a número entero (ID del cliente).
    let clientes = await leerClientes();                            // Lee la lista actual de clientes.

    const index = clientes.findIndex(c => c.id === id);            // Busca la posición (índice) del cliente cuyo id coincida.

    if (index !== -1) {                                            // Si encontró un cliente con ese ID...
      const eliminado = clientes.splice(index, 1);                 // Lo quita del array y obtiene el elemento eliminado.
      await guardarClientes(clientes);                             // Persiste la lista sin el cliente eliminado.
      res.json(eliminado[0]);                                      // Devuelve el cliente eliminado como confirmación.
    } else {                                                       // Si no existe un cliente con ese ID...
      res.status(404).json({ mensaje: "Cliente no encontrado" });  // Responde 404 (no encontrado) con un mensaje JSON.
    }
  } catch (error) {                                                
// Si ocurre cualquier error en el proceso...
    res.status(500).json({ error: 'Error al eliminar el cliente.' });// Responde 500 (error del servidor).
  }                                                                // Fin del catch.
});                      // Fin del handler DELETE /clientes/:id.

// Iniciamos el servidor
app.listen(PORT, () => {                                           
// Pone el servidor a escuchar en el puerto definido.
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);// Log informativo en consola con la URL local.
});                                                                // Fin de app.listen (el servidor queda activo)
