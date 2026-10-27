(function () {
  async function iniciarRecetario() {
    var estado = document.getElementById("recetario-estado");
    if (!estado) {
      return;
    }
    try {
      await window.recetarioServicio.listarTodos();
      estado.textContent = "Estructura base del módulo recetario cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base del recetario.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarRecetario);
})();
