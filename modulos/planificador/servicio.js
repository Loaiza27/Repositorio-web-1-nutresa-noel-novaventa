
(function () {
  const PLANES_MOCK = [
    {
      id: 1,
      idUsuario: 1042,
      nombre: "Mi menú semanal",
      fechaInicio: "2026-10-12",
      fechaFin: "2026-10-18",
      estado: "Activo"
    },
    {
      id: 2,
      idUsuario: 1042,
      nombre: "Semana de almuerzos ligeros",
      fechaInicio: "2026-10-05",
      fechaFin: "2026-10-11",
      estado: "Inactivo"
    },
    {
      id: 3,
      idUsuario: 1042,
      nombre: "Menú familiar de fin de mes",
      fechaInicio: "2026-10-26",
      fechaFin: "2026-11-01",
      estado: "Inactivo"
    }
  ];

  let siguienteId = 4;

  window.planificadorServicio = {
    async listarPorUsuario(idUsuario) {
      if (!idUsuario) return Promise.resolve([...PLANES_MOCK]);
      const id = parseInt(idUsuario, 10);
      return Promise.resolve(PLANES_MOCK.filter(p => p.idUsuario === id));
    },
    async crearPlan(datos) {
      const nuevo = { id: siguienteId++, ...datos, idUsuario: parseInt(datos.idUsuario, 10) };
      PLANES_MOCK.push(nuevo);
      return Promise.resolve(nuevo);
    },
    async modificarPlan(id, datos) {
      const idx = PLANES_MOCK.findIndex(p => p.id === id);
      if (idx !== -1) {
        PLANES_MOCK[idx] = { ...PLANES_MOCK[idx], ...datos, idUsuario: parseInt(datos.idUsuario, 10) };
        return Promise.resolve(PLANES_MOCK[idx]);
      }
      return Promise.resolve(null);
    },
    async eliminarPlan(id) {
      const idx = PLANES_MOCK.findIndex(p => p.id === id);
      if (idx !== -1) {
        PLANES_MOCK.splice(idx, 1);
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }
  };
})();