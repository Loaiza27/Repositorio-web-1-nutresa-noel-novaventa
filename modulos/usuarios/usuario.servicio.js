(function () {
  /*
    SERVICIO DE USUARIO (referencia)
  local - fuerza el dato mockeado
  api - fuerza API para este servicio
  api_config - delega al modo global
    ZONA DE CONFIGURACION RAPIDA (arriba de todo):
    local
    - window.USUARIO_SERVICIO_CONFIG.modo:
      "api_config" (usa API_CONFIG.modo), "local" o "api"
    - window.USUARIO_SERVICIO_CONFIG.mockSourceGlobal:
      nombre de la variable global con mock (por defecto "usuarioMockData")
    - window.USUARIO_SERVICIO_CONFIG.rutasApi:
      endpoints del modulo usuario (si el backend cambia, editar solo aqui)

    Estado actual:
    - USUARIO_SERVICIO_CONFIG.modo = "api_config" y API_CONFIG.modo = "local"
    - Lee y escribe sobre data mock en window.usuarioMockData (data/usuario.js)

    Cambio futuro a API real (opciones):
    1) Global para todo el proyecto: cambiar API_CONFIG.modo a "api" en services/api.config.js.
    2) Solo este modulo: cambiar USUARIO_SERVICIO_CONFIG.modo a "api".
    3) Si cambian endpoints, editar USUARIO_SERVICIO_CONFIG.rutasApi.
    3) Mantener el mismo shape de datos entre mock y API para no tocar la vista:
       usuario: { idUsuario, nombreUsuario, correo, rol, registradoEn, activo }
       sesion : { idSesion, idUsuario, token, inicioSesion, ultimoAcceso, estado }
  */

  window.USUARIO_SERVICIO_CONFIG = window.USUARIO_SERVICIO_CONFIG || {
    modo: "api_config",
    mockSourceGlobal: "usuarioMockData",
    rutasApi: {
      listarRegistrados: "/usuarios",
      listarLogeados: "/usuarios/logeados",
      registrar: "/usuarios/registro",
      iniciarSesion: "/usuarios/login",
      cerrarSesionBase: "/usuarios/sesiones/"
    }
  };

  var config = window.USUARIO_SERVICIO_CONFIG;
  var mockSource = window[config.mockSourceGlobal] || {};
  var usuarios = mockSource.usuarios || [];
  var sesiones = mockSource.sesionesActivas || [];

  function obtenerModo() {
    if (config.modo === "local" || config.modo === "api") {
      return config.modo;
    }
    return (window.API_CONFIG && window.API_CONFIG.modo) ? window.API_CONFIG.modo : "local";
  }

  function clonar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function obtenerSiguienteId(coleccion, campoId) {
    if (!coleccion.length) {
      return 1;
    }
    return Math.max.apply(null, coleccion.map(function (item) { return item[campoId]; })) + 1;
  }

  function buscarUsuarioPorCorreo(correo) {
    var correoNormalizado = String(correo || "").trim().toLowerCase();
    return usuarios.find(function (usuario) {
      return usuario.correo.toLowerCase() === correoNormalizado;
    }) || null;
  }

  async function listarRegistradosLocal() {
    return clonar(usuarios);
  }

  async function listarLogeadosLocal() {
    return sesiones
      .filter(function (sesion) { return sesion.estado === "activa"; })
      .map(function (sesion) {
        var usuario = usuarios.find(function (item) { return item.idUsuario === sesion.idUsuario; });
        if (!usuario) {
          return null;
        }
        return {
          idSesion: sesion.idSesion,
          idUsuario: usuario.idUsuario,
          nombreUsuario: usuario.nombreUsuario,
          correo: usuario.correo,
          rol: usuario.rol,
          inicioSesion: sesion.inicioSesion,
          ultimoAcceso: sesion.ultimoAcceso
        };
      })
      .filter(function (item) { return item !== null; });
  }

  async function registrarLocal(payload) {
    var existente = buscarUsuarioPorCorreo(payload.correo);
    if (existente) {
      throw new Error("Ya existe un usuario registrado con ese correo.");
    }

    var nuevoUsuario = {
      idUsuario: obtenerSiguienteId(usuarios, "idUsuario"),
      nombreUsuario: payload.nombreUsuario,
      correo: String(payload.correo).trim().toLowerCase(),
      rol: payload.rol || "user",
      registradoEn: new Date().toISOString(),
      activo: true
    };

    usuarios.push(nuevoUsuario);
    return clonar(nuevoUsuario);
  }

  async function iniciarSesionLocal(payload) {
    var usuario = buscarUsuarioPorCorreo(payload.correo);
    if (!usuario) {
      throw new Error("No existe un usuario registrado con ese correo.");
    }

    var sesionActiva = sesiones.find(function (item) {
      return item.idUsuario === usuario.idUsuario && item.estado === "activa";
    });

    if (sesionActiva) {
      sesionActiva.ultimoAcceso = new Date().toISOString();
      return clonar(sesionActiva);
    }

    var nuevaSesion = {
      idSesion: obtenerSiguienteId(sesiones, "idSesion"),
      idUsuario: usuario.idUsuario,
      token: "jwt-demo-" + usuario.idUsuario + "-" + Date.now(),
      inicioSesion: new Date().toISOString(),
      ultimoAcceso: new Date().toISOString(),
      estado: "activa"
    };

    sesiones.push(nuevaSesion);
    return clonar(nuevaSesion);
  }

  async function cerrarSesionLocal(idSesion) {
    var sesion = sesiones.find(function (item) { return item.idSesion === Number(idSesion); });
    if (!sesion) {
      throw new Error("No se encontro la sesion solicitada.");
    }
    sesion.estado = "cerrada";
    sesion.ultimoAcceso = new Date().toISOString();
    return true;
  }

  async function requestApi(ruta, opciones) {
    var respuesta = await fetch(window.API_CONFIG.baseUrl + ruta, opciones);
    if (!respuesta.ok) {
      throw new Error("Error en API de usuarios: " + respuesta.status);
    }
    if (respuesta.status === 204) {
      return null;
    }
    return respuesta.json();
  }

  window.usuarioServicio = {
    async listarRegistrados() {
      if (obtenerModo() === "api") {
        return requestApi(config.rutasApi.listarRegistrados, { method: "GET" });
      }
      return listarRegistradosLocal();
    },

    async listarLogeados() {
      if (obtenerModo() === "api") {
        return requestApi(config.rutasApi.listarLogeados, { method: "GET" });
      }
      return listarLogeadosLocal();
    },

    async registrar(payload) {
      if (obtenerModo() === "api") {
        return requestApi(config.rutasApi.registrar, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      return registrarLocal(payload);
    },

    async iniciarSesion(payload) {
      if (obtenerModo() === "api") {
        return requestApi(config.rutasApi.iniciarSesion, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      return iniciarSesionLocal(payload);
    },

    async cerrarSesion(idSesion) {
      if (obtenerModo() === "api") {
        return requestApi(config.rutasApi.cerrarSesionBase + idSesion, { method: "DELETE" });
      }
      return cerrarSesionLocal(idSesion);
    }
  };
})();
