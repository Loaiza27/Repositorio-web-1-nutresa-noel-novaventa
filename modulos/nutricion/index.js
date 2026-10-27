(function () {
  async function iniciarNutricion() {
    var estado = document.getElementById("nutricion-estado");
    if (!estado) {
      return;
    }
    try {
      await window.nutricionServicio.listarTodos();
      estado.textContent = "Estructura base del módulo nutrición cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base de nutrición.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarNutricion);
})();
