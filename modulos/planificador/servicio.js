/*
 * PlanSemanalServicio (simulado en el front).
 * Mismas operaciones que la interfaz del back (G5-PLA-C01):
 *   crear, buscarPorId, listarTodos, actualizar, eliminar, listarPorIdUsuario.
 * Los datos siguen el modelo PlanSemanal del back:
 *   id, nombre, fechaInicio, fechaFin, activo (Boolean), idUsuario.
 * Las llaves foráneas (idUsuario) usan solo ids del 1 al 5.
 */
(function () {
  "use strict";

  const planes = [
    { id: 1, nombre: "Mi menú semanal",             fechaInicio: "2026-10-12", fechaFin: "2026-10-18", activo: true,  idUsuario: 1 },
    { id: 2, nombre: "Semana de almuerzos ligeros", fechaInicio: "2026-10-05", fechaFin: "2026-10-11", activo: false, idUsuario: 1 },
    { id: 3, nombre: "Menú familiar de fin de mes", fechaInicio: "2026-10-26", fechaFin: "2026-11-01", activo: false, idUsuario: 1 }
  ];

  let siguienteId = 4;

  const copia = (plan) => ({ ...plan });

  window.planSemanalServicio = {
    /** Guarda un plan nuevo y lo devuelve con su id asignado. */
    async crear(plan) {
      const nuevo = { ...plan, id: siguienteId++ };
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