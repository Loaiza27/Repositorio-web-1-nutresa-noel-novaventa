(function () {
  async function iniciarComunidad() {
    var estado = document.getElementById("comunidad-estado");
    if (!estado) {
      return;
    }
    try {
      await window.comunidadServicio.listarTodos();
      estado.textContent = "Estructura base del módulo comunidad cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base de comunidad.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarComunidad);
})();
