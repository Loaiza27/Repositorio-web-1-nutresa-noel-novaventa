// ===== G5-COM · ComidaPlanificada · inicio =====
// ===== Configuración global del servicio =====
const PLANIFICADOR_SERVICIO_CONFIG = {
  // "api_config": toma API_CONFIG.modo | "local": mock | "api": backend
  // Queda en "local" mientras no exista el backend (api.config.js apunta a localhost:8080).
  // Al conectar la API real, cambiar a "api_config" o "api".
  modo: "local",
  mockSourceGlobal: "planificadorMockData",
  rutasApi: {
    listar: "/comidas-planificadas",
    crear: "/comidas-planificadas",
    eliminar: (id) => `/comidas-planificadas/${id}`,
    recetas: "/recetas"
  }
};

const PlanificadorServicio = (function () {
  function modoActual() {
    const modo = PLANIFICADOR_SERVICIO_CONFIG.modo;
    if (modo === "api_config") {
      return typeof API_CONFIG !== "undefined" && API_CONFIG.modo === "api" ? "api" : "local";
    }
    return modo;
  }

  function mock() {
    return window[PLANIFICADOR_SERVICIO_CONFIG.mockSourceGlobal];
  }

  async function pedir(ruta, opciones) {
    const respuesta = await fetch(API_CONFIG.baseUrl + ruta, {
      headers: { "Content-Type": "application/json" },
      ...opciones
    });
    if (!respuesta.ok) throw new Error("Error " + respuesta.status + " en el servidor");
    return respuesta.status === 204 ? null : respuesta.json();
  }

  // GET comidas del plan semanal
  async function listarComidas(idPlanSemanal) {
    if (modoActual() === "api") {
      return pedir(`${PLANIFICADOR_SERVICIO_CONFIG.rutasApi.listar}?idPlanSemanal=${idPlanSemanal}`);
    }
    return mock().comidasPlanificadas.filter((c) => c.idPlanSemanal === idPlanSemanal);
  }

  // POST nueva comida: { díaSemana, tipoComida, porciones, idReceta, idPlanSemanal }
  async function planificarComida(payload) {
    if (modoActual() === "api") {
      return pedir(PLANIFICADOR_SERVICIO_CONFIG.rutasApi.crear, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    const lista = mock().comidasPlanificadas;
    const repetida = lista.some(
      (c) =>
        c.idPlanSemanal === payload.idPlanSemanal &&
        c.díaSemana === payload.díaSemana &&
        c.tipoComida === payload.tipoComida
    );
    if (repetida) {
      throw new Error(`Ya hay una comida planificada para ${payload.díaSemana} (${payload.tipoComida}).`);
    }
    const nueva = { id: Math.max(0, ...lista.map((c) => c.id)) + 1, ...payload };
    lista.push(nueva);
    return nueva;
  }

  // DELETE comida
  async function eliminarComida(id) {
    if (modoActual() === "api") {
      return pedir(PLANIFICADOR_SERVICIO_CONFIG.rutasApi.eliminar(id), { method: "DELETE" });
    }
    const lista = mock().comidasPlanificadas;
    const i = lista.findIndex((c) => c.id === id);
    if (i >= 0) lista.splice(i, 1);
    return null;
  }

  // Normaliza una receta a { id, nombre } (acepta id/nombre o idReceta/nombreReceta)
  function normalizarReceta(r) {
    return { id: r.id ?? r.idReceta, nombre: r.nombre ?? r.nombreReceta };
  }

  // Recetas disponibles para elegir (id + nombre)
  async function listarRecetas() {
    if (modoActual() === "api") {
      const lista = await pedir(PLANIFICADOR_SERVICIO_CONFIG.rutasApi.recetas);
      return lista.map(normalizarReceta);
    }
    // Mock propio del módulo recetario (data/recetas.js)
    return (window.recetasData || []).map(normalizarReceta);
  }

  return { listarComidas, planificarComida, eliminarComida, listarRecetas };
})();

window.PlanificadorServicio = PlanificadorServicio;

// ===== G5-COM · ComidaPlanificada · fin =====