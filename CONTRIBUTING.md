# 🛒 Guía de Contribución - KN-Store

¡Gracias por tu interés en contribuir a KN-Store! Esta guía te ayudará a hacer tu primera contribución de forma sencilla.

## 🚀 Formas de Contribuir

Hay muchas maneras de ayudar, incluso si no eres programador:

- 🐛 **Reportar errores** que encuentres
- 💡 **Sugerir nuevas funcionalidades** para la tienda
- 📝 **Mejorar la documentación**
- 🎨 **Mejorar el diseño o la experiencia de usuario**
- 💻 **Escribir o mejorar código**
- 🧪 **Probar nuevas funcionalidades**

## 📋 Antes de Empezar

1. **Revisa los issues existentes** para ver si alguien ya está trabajando en algo similar
2. **Crea un issue** si quieres trabajar en algo nuevo, así evitamos duplicar esfuerzos
3. **Espera confirmación** antes de empezar a trabajar en cambios grandes

## 🔧 Configuración del Proyecto

### Requisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Git

### Instalación Local

```bash
# 1. Haz fork del repositorio en GitHub

# 2. Clona tu fork
git clone https://github.com/TU_USUARIO/2025-3279852-documentation-grupo-6.git
cd 2025-3279852-documentation-grupo-6

# 3. Instala las dependencias
npm install

# 4. Copia el archivo de configuración
cp .env.example .env

# 5. Inicia el servidor de desarrollo
npm run dev
```

## 📝 Proceso de Contribución

### 1. Crea una rama nueva

```bash
git checkout -b tipo/nombre-descriptivo
```

**Tipos de ramas:**
- `feature/` - Para nuevas funcionalidades
- `fix/` - Para corrección de errores
- `docs/` - Para cambios en documentación
- `style/` - Para cambios de diseño/CSS
- `refactor/` - Para refactorización de código
- `test/` - Para agregar o modificar pruebas

**Ejemplos:**
- `feature/carrito-compras`
- `fix/calculo-total-incorrecto`
- `docs/actualizar-readme`
- `style/mejorar-responsive`

### 2. Haz tus cambios

- Escribe código claro y fácil de entender
- Agrega comentarios cuando sea necesario
- Prueba tus cambios localmente

### 3. Convención de Commits (Conventional Commits)

**Es muy importante seguir este formato** para mantener un historial de cambios limpio y organizado.

#### Formato:
```
tipo(alcance): descripción breve

Descripción detallada (opcional)
```

#### Tipos de commits:

- **feat:** Nueva funcionalidad
  ```bash
  git commit -m "feat(carrito): agregar botón de compra rápida"
  ```

- **fix:** Corrección de errores
  ```bash
  git commit -m "fix(pagos): corregir cálculo de impuestos"
  ```

- **docs:** Cambios en documentación
  ```bash
  git commit -m "docs(readme): actualizar instrucciones de instalación"
  ```

- **style:** Cambios de formato, CSS, diseño (no afectan funcionalidad)
  ```bash
  git commit -m "style(productos): mejorar diseño de tarjetas"
  ```

- **refactor:** Refactorización de código (sin cambiar funcionalidad)
  ```bash
  git commit -m "refactor(auth): optimizar validación de usuarios"
  ```

- **test:** Agregar o modificar pruebas
  ```bash
  git commit -m "test(carrito): agregar pruebas unitarias"
  ```

- **chore:** Tareas de mantenimiento, dependencias, configuración
  ```bash
  git commit -m "chore(deps): actualizar dependencias"
  git commit -m "chore: configurar eslint"
  ```

- **perf:** Mejoras de rendimiento
  ```bash
  git commit -m "perf(productos): optimizar carga de imágenes"
  ```

#### Alcance (opcional):
El alcance indica qué parte del proyecto se ve afectada:
- `auth` - Autenticación
- `carrito` - Carrito de compras
- `productos` - Gestión de productos
- `pagos` - Sistema de pagos
- `usuarios` - Gestión de usuarios
- `admin` - Panel administrativo
- `api` - API del backend

#### Ejemplos completos:

**Buenos ejemplos:**
- ✅ `feat(carrito): implementar guardado automático`
- ✅ `fix(auth): resolver error de sesión expirada`
- ✅ `docs: agregar guía de despliegue`
- ✅ `style(navbar): mejorar responsividad en móviles`
- ✅ `chore(deps): actualizar React a v18`
- ✅ `refactor(productos): simplificar lógica de filtrado`

**Malos ejemplos:**
- ❌ `cambios en el carrito`
- ❌ `fix bug`
- ❌ `actualización`
- ❌ `mejoras varias`

### 4. Sube tus cambios

```bash
git push origin tipo/nombre-descriptivo
```

### 5. Crea un Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "Compare & pull request"
3. Escribe un título siguiendo la convención de commits:
   - `feat(productos): sistema de búsqueda avanzada`
   - `fix(carrito): error al eliminar productos`
4. En la descripción explica:
   - 📋 ¿Qué cambios hiciste?
   - 🎯 ¿Por qué son necesarios?
   - 🧪 ¿Cómo probaste los cambios?
   - 📸 Capturas de pantalla (si aplica)
5. Vincula el issue relacionado con `Closes #número`
6. Envía el pull request

**Plantilla de Pull Request:**
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 📝 Documentación
- [ ] 🎨 Estilo/UI

## ¿Cómo se probó?
Describe las pruebas realizadas

## Capturas de pantalla
(Si aplica)

## Checklist
- [ ] El código sigue las convenciones del proyecto
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación
- [ ] Los commits siguen la convención establecida
```

## 🐛 Reportar Errores

Si encuentras un error, crea un issue con esta información:

**Título:** `[BUG] Descripción breve del error`

**Plantilla:**
```markdown
## Descripción del error
¿Qué está fallando?

## Pasos para reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Observa el error

## Comportamiento esperado
¿Qué debería pasar?

## Comportamiento actual
¿Qué está pasando realmente?

## Capturas de pantalla
(Si aplica)

## Entorno
- Navegador: [ej. Chrome 120]
- Sistema operativo: [ej. Windows 11]
- Versión de KN-Store: [ej. 1.2.0]
```

## 💡 Sugerir Funcionalidades

Para sugerir una nueva característica:

**Título:** `[FEATURE] Nombre de la funcionalidad`

**Plantilla:**
```markdown
## Descripción de la funcionalidad
¿Qué quieres que se agregue?

## Problema que resuelve
¿Por qué es necesaria esta funcionalidad?

## Solución propuesta
¿Cómo funcionaría?

## Alternativas consideradas
¿Hay otras formas de resolver esto?

## Beneficios para KN-Store
¿Cómo mejorará la tienda?
```

## ✅ Estándares de Código

### JavaScript/TypeScript
- Usa nombres descriptivos para variables y funciones
- Prefiere `const` sobre `let`, evita `var`
- Usa comillas simples `'` para strings
- Agrega punto y coma al final de cada línea
- Usa camelCase para variables: `nombreProducto`
- Usa PascalCase para componentes: `ProductCard`

### CSS
- Usa nombres de clases descriptivos
- Prefiere metodología BEM o clases de utilidad
- Organiza las propiedades alfabéticamente
- Comenta secciones complejas

### Estructura de Archivos
```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación
├── services/      # Servicios y API calls
├── utils/         # Funciones auxiliares
├── styles/        # Estilos globales
└── assets/        # Imágenes, iconos, etc.
```

### Comentarios
```javascript
// ✅ Buenos comentarios
// Calcula el total aplicando descuentos y impuestos
const calcularTotal = (subtotal, descuento) => { ... }

// ❌ Comentarios innecesarios
// suma a y b
const suma = (a, b) => a + b
```

## 🧪 Pruebas

Antes de enviar tu pull request:

- [ ] El código funciona sin errores en consola
- [ ] Probaste en diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Probaste en dispositivos móviles o modo responsive
- [ ] La tienda sigue funcionando correctamente
- [ ] No rompiste ninguna funcionalidad existente
- [ ] Los commits siguen la convención establecida
- [ ] El código sigue los estándares del proyecto

## 🔄 Flujo de Trabajo Completo

```bash
# 1. Actualiza tu fork
git checkout main
git pull upstream main

# 2. Crea una rama nueva
git checkout -b feat/nueva-funcionalidad

# 3. Haz cambios y commits
git add .
git commit -m "feat(productos): agregar filtro por categoría"

# 4. Más cambios si es necesario
git add .
git commit -m "docs(productos): actualizar documentación de filtros"

# 5. Sube los cambios
git push origin feat/nueva-funcionalidad

# 6. Crea el Pull Request en GitHub
```

## 📚 Recursos Útiles

- [Repositorio de KN-Store](https://github.com/SENA-PROJECTS/2025-3279852-documentation-grupo-6)
- [Conventional Commits](https://www.conventionalcommits.org/es/)
- [Documentación de Git](https://git-scm.com/doc)
- [Guía de Markdown](https://www.markdownguide.org/)
- [Cómo hacer un Pull Request](https://docs.github.com/es/pull-requests)

## ❓ ¿Necesitas Ayuda?

- Crea un issue con la etiqueta `question`
- Contacta a los mantenedores del proyecto
- Revisa la documentación existente
- Pregunta en las discusiones del repositorio

## 📜 Código de Conducta

- Sé respetuoso y profesional con todos los colaboradores
- Acepta críticas constructivas con mente abierta
- Ayuda a otros contribuidores cuando puedas
- Céntrate en lo mejor para el proyecto KN-Store
- Respeta las decisiones de los mantenedores

## 🎉 ¡Gracias por Contribuir!

Cada contribución, grande o pequeña, hace que KN-Store sea mejor. ¡Apreciamos tu tiempo y esfuerzo!

El equipo de desarrollo de KN-Store está comprometido con crear la mejor experiencia de tienda virtual posible, y tu ayuda es fundamental para lograrlo.

---

**Proyecto desarrollado por:** SENA - Grupo 6 - Ficha 3279852
