(function () {
  var tbodyRegistrados = document.getElementById("usuarios-registrados-body");
  var listaLogeados = document.getElementById("usuarios-logeados-lista");
  var alerta = document.getElementById("usuarios-alerta");
  var formRegistro = document.getElementById("form-registro");
  var formLogin = document.getElementById("form-login");
  var botonToggleListado = document.getElementById("toggle-listado-usuarios");
  var panelListadoUsuarios = document.getElementById("panel-listado-usuarios");

  function mostrarMensaje(mensaje, esError) {
    alerta.textContent = mensaje;
    alerta.setAttribute("role", esError ? "alert" : "status");
  }

  function formatearFecha(valor) {
    var fecha = new Date(valor);
    return fecha.toLocaleString("es-CO");
  }

  function obtenerModoActual() {
    var config = window.USUARIO_SERVICIO_CONFIG || {};
    if (config.modo === "local" || config.modo === "api") {
      return config.modo;
    }
    return (window.API_CONFIG && window.API_CONFIG.modo) ? window.API_CONFIG.modo : "local";
  }

  function renderizarRegistrados(usuarios) {
    tbodyRegistrados.innerHTML = usuarios.map(function (usuario) {
      return (
        "<tr>" +
        "<td>" + usuario.idUsuario + "</td>" +
        "<td>" + usuario.nombreUsuario + "</td>" +
        "<td>" + usuario.correo + "</td>" +
        "<td>" + usuario.rol + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderizarLogeados(sesiones) {
    if (!sesiones.length) {
      listaLogeados.innerHTML = '<p class="sesion-item">No hay sesiones activas en este momento.</p>';
      return;
    }

    listaLogeados.innerHTML = sesiones.map(function (sesion) {
      return (
        '<article class="sesion-item">' +
        "<h3>" + sesion.nombreUsuario + "</h3>" +
        "<p><strong>Correo:</strong> " + sesion.correo + "</p>" +
        "<p><strong>Rol:</strong> " + sesion.rol + "</p>" +
        "<p><strong>Ingreso:</strong> " + formatearFecha(sesion.inicioSesion) + "</p>" +
        "<p><strong>Último acceso:</strong> " + formatearFecha(sesion.ultimoAcceso) + "</p>" +
        '<button class="btn btn-secundario" type="button" data-cerrar-sesion="' + sesion.idSesion + '">Cerrar sesión</button>' +
        "</article>"
      );
    }).join("");
  }

  async function cargarDatos() {
    var usuarios = await window.usuarioServicio.listarRegistrados();
    var logeados = await window.usuarioServicio.listarLogeados();
    renderizarRegistrados(usuarios);
    renderizarLogeados(logeados);
    mostrarMensaje(
      "Modo actual: " + obtenerModoActual() + ". Datos cargados correctamente para demostración.",
      false
    );
  }

  formRegistro.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    try {
      await window.usuarioServicio.registrar({
        nombreUsuario: formRegistro.nombreUsuario.value.trim(),
        correo: formRegistro.correo.value.trim(),
        rol: formRegistro.rol.value
      });
      formRegistro.reset();
      await cargarDatos();
      mostrarMensaje("Usuario registrado exitosamente en modo " + obtenerModoActual() + ".", false);
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  });

  formLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    try {
      await window.usuarioServicio.iniciarSesion({
        correo: formLogin.correo.value.trim()
      });
      formLogin.reset();
      await cargarDatos();
      mostrarMensaje("Sesión iniciada correctamente en modo " + obtenerModoActual() + ".", false);
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  });

  listaLogeados.addEventListener("click", async function (evento) {
    var idSesion = evento.target.getAttribute("data-cerrar-sesion");
    if (!idSesion) {
      return;
    }
    try {
      await window.usuarioServicio.cerrarSesion(idSesion);
      await cargarDatos();
      mostrarMensaje("Sesión cerrada correctamente.", false);
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  });

  botonToggleListado.addEventListener("click", function () {
    var estabaOculto = panelListadoUsuarios.classList.contains("usuarios-paneles-oculto");
    panelListadoUsuarios.classList.toggle("usuarios-paneles-oculto", !estabaOculto);
    botonToggleListado.setAttribute("aria-expanded", String(estabaOculto));
    botonToggleListado.textContent = estabaOculto
      ? "Ocultar listado temporal de usuarios"
      : "Ver listado temporal de usuarios";
  });

  document.addEventListener("DOMContentLoaded", function () {
    cargarDatos().catch(function (error) {
      mostrarMensaje("No fue posible cargar los datos de usuarios.", true);
      console.error(error);
    });
  });
})();
