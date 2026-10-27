(function () {
  async function iniciarMercadeo() {
    var estado = document.getElementById("mercadeo-estado");
    if (!estado) {
      return;
    }
    try {
      await window.mercadeoServicio.listarTodos();
      estado.textContent = "Estructura base del módulo mercadeo cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base de mercadeo.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarMercadeo);
})();
