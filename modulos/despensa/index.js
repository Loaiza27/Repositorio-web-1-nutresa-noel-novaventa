(function () {
  async function iniciarDespensa() {
    var estado = document.getElementById("despensa-estado");
    if (!estado) {
      return;
    }
    try {
      await window.despensaServicio.listarTodos();
      estado.textContent = "Estructura base del módulo despensa cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base de despensa.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarDespensa);
})();
