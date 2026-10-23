/*
 * PlanSemanalServicio (simulado en el front).
 * Mismas operaciones que la interfaz del back (G5-PLA-C01):
 *   crear, buscarPorId, listarTodos, actualizar, eliminar, listarPorIdUsuario.
 * Los datos siguen el modelo PlanSemanal del back:
 *   id, nombre, fechaInicio, fechaFin, activo (Boolean), idUsuario.
 * Campo extra solo de la interfaz: dias (receta de lun a dom, texto vacío = "Vacío").
 * Los ids de los planes van del 1 al 5: otras clases (p. ej. el select de
 * Samudio) llenan sus opciones con listarTodos() y apuntan solo a esos ids.
 * Las llaves foráneas (idUsuario) también usan solo ids del 1 al 5.
 */
(function () {
  "use strict";

  const ID_MINIMO = 1;
  const ID_MAXIMO = 5;

  const planes = [
    { id: 1, nombre: "Mi menú semanal",             fechaInicio: "2026-10-12", fechaFin: "2026-10-18", activo: true,  idUsuario: 1,
      dias: { lun: "Pasta", mar: "Arroz", mie: "", jue: "Sopa", vie: "Tortilla" } },
    { id: 2, nombre: "Semana de almuerzos ligeros", fechaInicio: "2026-10-05", fechaFin: "2026-10-11", activo: false, idUsuario: 1,
      dias: { lun: "Lentejas", mar: "", mie: "Pollo", jue: "", vie: "Pizza" } },
    { id: 3, nombre: "Menú familiar de fin de mes", fechaInicio: "2026-10-26", fechaFin: "2026-11-01", activo: false, idUsuario: 1,
      dias: { lun: "", mar: "", mie: "", jue: "", vie: "" } }
  ];

  // Menor id libre entre 1 y 5 (null si ya están los cinco ocupados).
  function siguienteIdLibre() {
    for (let id = ID_MINIMO; id <= ID_MAXIMO; id++) {
      if (!planes.some((p) => p.id === id)) return id;
    }
    return null;
  }

  const copia = (plan) => ({ ...plan, dias: plan.dias ? { ...plan.dias } : undefined });

  window.planSemanalServicio = {
    /** Guarda un plan nuevo y lo devuelve con su id asignado. */
    async crear(plan) {
      const id = siguienteIdLibre();
      if (id === null) {
        throw new Error("Solo se permiten planes con id del 1 al 5. Elimina uno para crear otro.");
      }
      const nuevo = { ...plan, id };
      planes.push(nuevo);
      return copia(nuevo);
    },

    /** Devuelve el plan con ese id, o null si no existe. */
    async buscarPorId(id) {
      const plan = planes.find((p) => p.id === Number(id));
      return plan ? copia(plan) : null;
    },

    /** Devuelve todos los planes; si no hay ninguno, una lista vacía (nunca null). */
    async listarTodos() {
      return planes.map(copia);
    },

    /** Reemplaza los datos del plan con ese id y lo devuelve; null si no existe. */
    async actualizar(id, plan) {
      const idx = planes.findIndex((p) => p.id === Number(id));
      if (idx === -1) return null;
      planes[idx] = { ...plan, id: Number(id) };
      return copia(planes[idx]);
    },

    /** Elimina el plan con ese id; true si lo eliminó, false si no existía. */
    async eliminar(id) {
      const idx = planes.findIndex((p) => p.id === Number(id));
      if (idx === -1) return false;
      planes.splice(idx, 1);
      return true;
    },

    /** Devuelve los planes que tengan ese idUsuario. */
    async listarPorIdUsuario(idUsuario) {
      return planes.filter((p) => p.idUsuario === Number(idUsuario)).map(copia);
    }
  };
})();

/* ===== G5-LIS · inicio · Mock de listaMercadoServicio =====
   Asume el módulo de Samudio (Lista de Mercado) pero no lo define nadie más.
   Aquí se guarda en memoria para la demo. En producción, esto se sustituye
   por la llamada fetch() al backend Java. */
(function () {
  "use strict";
  const listasCreadas = [];
  window.listaMercadoServicio = {
    async crear(lista) {
      listasCreadas.push(lista);
      return { ...lista, id: listasCreadas.length };
    },
    _listasCreadas: listasCreadas
  };
})();
/* ===== G5-LIS · fin ===== */