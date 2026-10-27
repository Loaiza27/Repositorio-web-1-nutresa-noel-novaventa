# Repositorio Web 1 · Nutresa/Noel/Novaventa

Base inicial del proyecto **Sazón** en HTML, CSS y JavaScript (sin frameworks), alineada al plan de trabajo y al kit de marca.

## Estructura base

```text
.
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ sazon.css               # Estilos globales base (NO modificar)
│  └─ js/
│     └─ layout.js               # Navbar y footer comunes
├─ services/
│  ├─ api.config.js
├─ data/
│  ├─ usuario.js                  # Datos mock principales para demo
│  ├─ productos.js
│  └─ recetas.js
└─ modulos/
   ├─ usuarios/                   # Módulo común (demo docente)
   │  └─ usuario.servicio.js      # Servicio local/api del módulo
   ├─ catalogo/
   ├─ recetario/
   ├─ despensa/
   ├─ nutricion/
   ├─ planificador/
   ├─ comunidad/
   └─ mercadeo/
```

## Cómo trabajar en este repositorio

### 1) Trabajo por equipo/célula

- Cada equipo trabaja **solo en su carpeta** dentro de `modulos/`.
- En esa carpeta puede crear o modificar lo necesario para sus historias de usuario (`index.html`, `index.js`, `servicio.js` y archivos adicionales).
- Cada equipo puede tener su **propio CSS del módulo** (por ejemplo `modulos/<equipo>/<equipo>.css`) e importarlo en su HTML.
- El módulo `modulos/usuarios/` queda como referencia común para mostrar registro/login y patrón de servicio.

### 1.1) Datos mock centralizados

- Mientras no se conecte backend, usamos datos mock en `data/usuario.js`.
- `usuario.js` simula la respuesta de API y expone `window.usuarioMockData`.
- Para el ejemplo docente, se incluyen:
  - `usuarioMockData.usuarios`
  - `usuarioMockData.sesionesActivas`
- `productos.js` y `recetas.js` mantienen sus mocks propios del módulo.

### 2) Regla de estilos globales

- El archivo `assets/css/sazon.css` es la **base común del proyecto**.
- **No se debe modificar `sazon.css`**.
- Personalizaciones visuales por HU o por célula deben hacerse en el CSS propio del módulo.

### 3) Flujo Git (según “Cómo ramificamos el código”)

Este proyecto usa el flujo documentado en Sazón:
- `main`: producción (estable)
- `develop`: integración
- `feature/<modulo>/<hu>`: rama corta por historia de usuario

#### Paso a paso recomendado

1. El líder del equipo hace **Fork** de este repositorio en GitHub.
2. El equipo clona su fork localmente.
3. Desde el fork, crean (o sincronizan) la rama `develop`.
4. Cada integrante crea su rama de HU desde `develop`:
   - `feature/catalogo/HU-XX-...`
   - `feature/recetario/HU-XX-...`
   - `feature/despensa/HU-XX-...`
   - `feature/nutricion/HU-XX-...`
   - `feature/planificador/HU-XX-...`
   - `feature/comunidad/HU-XX-...`
   - `feature/mercadeo/HU-XX-...`
5. Trabajan cambios en su carpeta de módulo y hacen commits frecuentes.
6. Abren Pull Request de su rama de HU hacia `develop` del fork.
7. Integran a `main` solo mediante Pull Request cuando corresponda entrega/release.

### 4) Reglas clave de colaboración

- Sin push directo a `main` ni `develop`.
- Una rama por HU, corta y enfocada.
- Sincronizar frecuentemente con `develop`.
- Respetar la zona del equipo: no intervenir carpetas de otros módulos sin acuerdo del equipo docente.

## Ejemplo de servicio preparado para API

Se dejó el servicio `modulos/usuarios/usuario.servicio.js` para mostrar exactamente cómo deben trabajar las HUs:

- El servicio tiene una **zona de configuración global al inicio**:
  - `USUARIO_SERVICIO_CONFIG.modo`:
    - `"api_config"`: toma el modo general de `API_CONFIG.modo`
    - `"local"`: fuerza mock solo para usuario
    - `"api"`: fuerza API solo para usuario
  - `USUARIO_SERVICIO_CONFIG.mockSourceGlobal`:
    - nombre de la variable mock (por defecto `usuarioMockData`)
  - `USUARIO_SERVICIO_CONFIG.rutasApi`:
    - rutas del backend de usuario en un solo lugar
- Si el servicio queda en modo local, lee/escribe sobre `data/usuario.js`.
- Si el servicio queda en modo api, usa `fetch` contra `API_CONFIG.baseUrl`.
- Mismos métodos en ambos modos (sin cambiar la vista):
  - `listarRegistrados()`
  - `listarLogeados()`
  - `registrar(payload)`
  - `iniciarSesion(payload)`
  - `cerrarSesion(idSesion)`

Con este patrón, los estudiantes primero desarrollan con mock y luego cambian solo configuración/rutas de API, no toda la interfaz.
Cada equipo puede hacer ese cambio en su propio servicio cuando esté listo, sin bloquear a otros módulos.

## Ejecución local

1. Abrir `index.html` con Live Server (o servidor estático).
2. Navegar por cada módulo.
3. Mantener scripts en orden clásico (sin módulos ES).