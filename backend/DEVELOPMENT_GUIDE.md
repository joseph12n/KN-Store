🏗️ KN-Store: Estándares de Desarrollo (Backend v1.0)
Este documento es la fuente de verdad para el desarrollo del backend de KN-Store. La IA debe seguir estas reglas para mantener la consistencia con la estructura de archivos existente.

📂 Estructura de Archivos Actual
El proyecto se organiza bajo la carpeta /backend con el siguiente esquema:

server.js: Punto de entrada principal de la aplicación.

config/: Configuración de base de datos (db.js).

controllers/: Lógica de orquestación de peticiones (camelCase).

middlewares/: Filtros de seguridad y Validadores de esquemas (Zod/Joi).

models/: Definición de esquemas de datos (PascalCase, ej: User.js).

routes/: Definición de endpoints, vinculados a controladores.

utils/: Funciones de ayuda reutilizables (ej: generateToken.js).

🛠️ Reglas de Oro para el Desarrollo
1. Nomenclatura Estricta (Strict Naming)
Para evitar errores de importación en sistemas Linux/Case-sensitive:

Modelos: Siempre en PascalCase y singular (Product.js, Category.js).

Controladores/Rutas/Middlewares: Siempre en camelCase (productController.js, productRoutes.js).

Variables y Funciones: camelCase.

2. Flujo de Peticiones (Senior Flow)
Cada petición debe seguir este orden sin saltarse pasos:

Ruta: Recibe el hit.

Middleware de Validación: Comprueba que el req.body sea correcto.

Controlador: Extrae los datos y llama a la lógica necesaria.

Respuesta: El controlador siempre devuelve un JSON estructurado: { success: true, data: {...} } o { success: false, message: "..." }.

3. Manejo de Errores y Seguridad
No Hardcoding: Todas las credenciales deben llamarse desde process.env.

Try/Catch: Todo bloque asíncrono en controladores debe estar envuelto en un bloque de error que pase el control al middleware de errores global.

Status Codes: Usar códigos HTTP correctos (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error).

🤖 Instrucciones para el Editor (AI Context)
Contexto: Estás trabajando en un ecommerce de calzado (KN-Store).

Importaciones: Usa import/export (ES Modules) si el proyecto está configurado así, o require si es CommonJS. Revisa package.json antes de escribir.

Validaciones: Si falta un validador para una nueva entidad, créalo primero en middlewares/ antes de escribir el controlador.

Escalabilidad: Al crear nuevas tablas o colecciones, asegúrate de mantener la relación lógica con los modelos existentes (Category, Subcategory, Product).