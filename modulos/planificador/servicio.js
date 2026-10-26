/*
 * PlanSemanalServicio (simulado en el front).
 * ===== G5-CAL-F03 · Semilla de datos =====
 *   IDs 1-5: registros iniciales consecutivos (no alterar ni borrar).
 *   IDs 6-8: registros adicionales al final para simular distintas semanas.
 *   Las recetas referenciadas apuntan a IDs válidos de RECETAS_VALIDAS.
 *   Las llaves foráneas (idUsuario) usan IDs del 1 al 5.
 * ===== G5-CAL-F03 · fin =====
 */
(function () {
  "use strict";

  const RECETAS_VALIDAS = [
    { id: 1, nombre: "Pasta" }, { id: 2, nombre: "Arroz" },
    { id: 3, nombre: "Sopa" }, { id: 4, nombre: "Tortilla" },
    { id: 5, nombre: "Lentejas" }, { id: 6, nombre: "Pollo" },
    { id: 7, nombre: "Pizza" }, { id: 8, nombre: "Huevos" },
    { id: 9, nombre: "Ensalada" }, { id: 10, nombre: "Pescado" }
  ];

  function recetaValida(n) { return !n || RECETAS_VALIDAS.some((r) => r.nombre === n); }

  const planes = [
    { id: 1, nombre: "Mi menú semanal", fechaInicio: "2026-10-12", fechaFin: "2026-10-18", activo: true, idUsuario: 1, semana: 42,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Pasta", cena: "Sopa" }, mar: { desayuno: "", almuerzo: "Arroz", cena: "Pollo" }, mie: { desayuno: "Huevos", almuerzo: "", cena: "Ensalada" }, jue: { desayuno: "", almuerzo: "Sopa", cena: "Pescado" }, vie: { desayuno: "Huevos", almuerzo: "Pasta", cena: "Tortilla" }, sab: { desayuno: "", almuerzo: "", cena: "Pizza" }, dom: { desayuno: "Huevos", almuerzo: "Pollo", cena: "" } } },
    { id: 2, nombre: "Semana de almuerzos ligeros", fechaInicio: "2026-10-05", fechaFin: "2026-10-11", activo: false, idUsuario: 1, semana: 41,
      dias: { lun: { desayuno: "", almuerzo: "Lentejas", cena: "Ensalada" }, mar: { desayuno: "Huevos", almuerzo: "", cena: "Pollo" }, mie: { desayuno: "", almuerzo: "Arroz", cena: "Sopa" }, jue: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "" }, vie: { desayuno: "", almuerzo: "Pasta", cena: "Pizza" }, sab: { desayuno: "", almuerzo: "", cena: "" }, dom: { desayuno: "Huevos", almuerzo: "Pollo", cena: "Pescado" } } },
    { id: 3, nombre: "Menú familiar de fin de mes", fechaInicio: "2026-10-26", fechaFin: "2026-11-01", activo: false, idUsuario: 1, semana: 44,
      dias: { lun: { desayuno: "", almuerzo: "", cena: "" }, mar: { desayuno: "", almuerzo: "", cena: "" }, mie: { desayuno: "", almuerzo: "", cena: "" }, jue: { desayuno: "", almuerzo: "", cena: "" }, vie: { desayuno: "", almuerzo: "", cena: "" }, sab: { desayuno: "", almuerzo: "", cena: "" }, dom: { desayuno: "", almuerzo: "", cena: "" } } },
    { id: 4, nombre: "Plan vegetariano semanal", fechaInicio: "2026-11-02", fechaFin: "2026-11-08", activo: false, idUsuario: 2, semana: 45,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "Sopa" }, mar: { desayuno: "", almuerzo: "Arroz", cena: "Pasta" }, mie: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "Tortilla" }, jue: { desayuno: "", almuerzo: "Arroz", cena: "Sopa" }, vie: { desayuno: "Huevos", almuerzo: "Pasta", cena: "Ensalada" }, sab: { desayuno: "", almuerzo: "", cena: "Pizza" }, dom: { desayuno: "", almuerzo: "", cena: "" } } },
    { id: 5, nombre: "Sprint de cocina rápida", fechaInicio: "2026-11-09", fechaFin: "2026-11-15", activo: false, idUsuario: 2, semana: 46,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Pizza", cena: "Pollo" }, mar: { desayuno: "", almuerzo: "Pasta", cena: "Tortilla" }, mie: { desayuno: "Huevos", almuerzo: "Arroz", cena: "Pescado" }, jue: { desayuno: "", almuerzo: "Sopa", cena: "Pollo" }, vie: { desayuno: "Huevos", almuerzo: "Pizza", cena: "Ensalada" }, sab: { desayuno: "", almuerzo: "Pasta", cena: "Arroz" }, dom: { desayuno: "", almuerzo: "", cena: "" } } },
    /* IDs 6-8: registros adicionales al final para simular distintas semanas */
    { id: 6, nombre: "Semana 1 - Recetas de invierno", fechaInicio: "2025-12-29", fechaFin: "2026-01-04", activo: false, idUsuario: 3, semana: 1,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Sopa", cena: "Pasta" }, mar: { desayuno: "", almuerzo: "Arroz", cena: "Lentejas" }, mie: { desayuno: "Huevos", almuerzo: "Pollo", cena: "Sopa" }, jue: { desayuno: "", almuerzo: "Pasta", cena: "Tortilla" }, vie: { desayuno: "Huevos", almuerzo: "Pescado", cena: "Arroz" }, sab: { desayuno: "", almuerzo: "Ensalada", cena: "Pizza" }, dom: { desayuno: "Huevos", almuerzo: "Pollo", cena: "Sopa" } } },
    { id: 7, nombre: "Semana 12 - Menú de primavera", fechaInicio: "2026-03-16", fechaFin: "2026-03-22", activo: false, idUsuario: 3, semana: 12,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "Pescado" }, mar: { desayuno: "", almuerzo: "Arroz", cena: "Pollo" }, mie: { desayuno: "Huevos", almuerzo: "Pasta", cena: "Ensalada" }, jue: { desayuno: "", almuerzo: "Sopa", cena: "Tortilla" }, vie: { desayuno: "Huevos", almuerzo: "Pizza", cena: "Arroz" }, sab: { desayuno: "", almuerzo: "Pasta", cena: "Pollo" }, dom: { desayuno: "Huevos", almuerzo: "Lentejas", cena: "Ensalada" } } },
    { id: 8, nombre: "Semana 26 - Menú de verano", fechaInicio: "2026-06-22", fechaFin: "2026-06-28", activo: false, idUsuario: 4, semana: 26,
      dias: { lun: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "Pescado" }, mar: { desayuno: "", almuerzo: "Pollo", cena: "Ensalada" }, mie: { desayuno: "Huevos", almuerzo: "Arroz", cena: "Pescado" }, jue: { desayuno: "", almuerzo: "Pasta", cena: "Ensalada" }, vie: { desayuno: "Huevos", almuerzo: "Pizza", cena: "Pollo" }, sab: { desayuno: "", almuerzo: "Sopa", cena: "Pasta" }, dom: { desayuno: "Huevos", almuerzo: "Ensalada", cena: "Pescado" } } }
  ];

  /* G5-CAL-F03 · verificación de la semilla: IDs consecutivos desde 1, recetas existentes,
     llaves foráneas válidas y semana coherente con fechaInicio. Solo avisa si algo falla. */
  const TIEMPOS_COMIDA = ["desayuno", "almuerzo", "cena"];
  function verificarSemilla(lista) {
    const errores = [];
    lista.forEach((p, i) => {
      if (p.id !== i + 1) errores.push(`ID no consecutivo: se esperaba ${i + 1} y llegó ${p.id}.`);
      if (!Number.isInteger(p.idUsuario) || p.idUsuario < 1) errores.push(`Plan ${p.id}: idUsuario inválido.`);
      if (p.semana !== calcularSemana(p.fechaInicio)) errores.push(`Plan ${p.id}: la semana ${p.semana} no coincide con fechaInicio ${p.fechaInicio}.`);
      Object.entries(p.dias || {}).forEach(([dia, comidas]) => TIEMPOS_COMIDA.forEach((t) => {
        if (!recetaValida(comidas[t])) errores.push(`Plan ${p.id}, ${dia}/${t}: receta inexistente "${comidas[t]}".`);
      }));
    });
    return { ok: errores.length === 0, errores };
  }
  const resultadoSemilla = verificarSemilla(planes);
  if (!resultadoSemilla.ok) console.warn("Semilla de planes inconsistente:", resultadoSemilla.errores);

  let siguienteId = planes.length + 1;

  function copia(plan) {
    if (!plan) return null;
    const c = { ...plan };
    if (plan.dias) { c.dias = {}; Object.keys(plan.dias).forEach((d) => { c.dias[d] = typeof plan.dias[d] === "object" && plan.dias[d] ? { ...plan.dias[d] } : plan.dias[d]; }); }
    return c;
  }

  function calcularSemana(fechaIso) {
    if (!fechaIso) return null;
    const [y, m, d] = fechaIso.split("-").map(Number);
    const fecha = new Date(Date.UTC(y, m - 1, d));
    if (isNaN(fecha.getTime())) return null;
    const diaSemana = fecha.getUTCDay() || 7;
    const jueves = new Date(fecha);
    jueves.setUTCDate(jueves.getUTCDate() + (4 - diaSemana));
    const inicio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1));
    return Math.floor((jueves.getTime() - inicio.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  }

  function asegurarSemana(plan) {
    if (!plan) return plan;
    if (plan.semana === undefined || plan.semana === null || plan.semana === "") return { ...plan, semana: calcularSemana(plan.fechaInicio) };
    return plan;
  }

  window.planSemanalServicio = {
    async crear(plan) {
      const p = asegurarSemana(plan);
      if (p.dias) Object.values(p.dias).forEach((d) => { if (typeof d === "object" && d) Object.values(d).forEach((r) => { if (!recetaValida(r)) throw new Error(`Receta inválida: "${r}".`); }); });
      const nuevo = { ...p, id: siguienteId++ };
      planes.push(nuevo);
      return copia(nuevo);
    },
    async buscarPorId(id) { const p = planes.find((x) => x.id === Number(id)); return p ? copia(p) : null; },
    async listarTodos() { return planes.map(copia); },
    async actualizar(id, plan) { const i = planes.findIndex((x) => x.id === Number(id)); if (i === -1) return null; const p = asegurarSemana(plan); planes[i] = { ...p, id: Number(id) }; return copia(planes[i]); },
    async eliminar(id) { const i = planes.findIndex((x) => x.id === Number(id)); if (i === -1) return false; planes.splice(i, 1); return true; },
    async listarPorIdUsuario(u) { return planes.filter((p) => p.idUsuario === Number(u)).map(copia); },

    /* HU 5.1.1: obtenerPlanSemanal(semana) — async con try/catch.
       Busca primero en los planes locales (el más reciente de esa semana) y, si no hay,
       en los planes reales guardados en MockAPI. */
    async obtenerPlanSemanal(semana) {
      const n = Number(semana);
      if (!Number.isInteger(n) || n < 1 || n > 53) throw new Error("La semana debe ser un entero entre 1 y 53.");
      const locales = planes.filter((x) => x.semana === n);
      if (locales.length > 0) return copia(locales[locales.length - 1]);
      try { return await window.planApiServicio.obtenerPorSemana(n); } catch (e) { return null; }
    },

    async listarRecetas() { return RECETAS_VALIDAS.map((r) => ({ ...r })); },

    /* G5-CAL-F03: permite comprobar la semilla desde la consola (planSemanalServicio.verificarSemilla()) */
    verificarSemilla() { return verificarSemilla(planes); }
  };
})();

/* Mock de listaMercadoServicio (Samudio) */
(function () {
  "use strict";
  const listas = [];
  window.listaMercadoServicio = {
    async crear(l) { listas.push(l); return { ...l, id: listas.length }; },
    _listasCreadas: listas
  };
})();

/* ===== G5-API · servicio de MockAPI (datos reales, sin inventar nada) ===== */
(function () {
  "use strict";
  const API_URL = "https://6ada65867512f497b3ffe9ee.mockapi.io/api/v1/planSemanal";

  function aFechaIso(v) {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number") { const d = new Date(v < 1e12 ? v * 1000 : v); return isNaN(d.getTime()) ? "" : d.toISOString().substring(0, 10); }
    const m = String(v).match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : "";
  }

  function calcularSemanaIso(fechaIso) {
    if (!fechaIso) return null;
    const [y, m, d] = fechaIso.split("-").map(Number);
    const f = new Date(Date.UTC(y, m - 1, d));
    const dow = f.getUTCDay() || 7;
    const jueves = new Date(f); jueves.setUTCDate(jueves.getUTCDate() + (4 - dow));
    const inicio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1));
    return Math.floor((jueves.getTime() - inicio.getTime()) / (7 * 86400000)) + 1;
  }

  /* Registro de MockAPI -> forma de plan que entiende el calendario. Solo transforma, no inventa. */
  function aPlan(r) {
    const fechaInicio = aFechaIso(r.fechaInicio);
    const dias = r.dias && typeof r.dias === "object" && !Array.isArray(r.dias) ? r.dias : {};
    return {
      id: r.id, origen: "api",
      nombre: r.nombre ? String(r.nombre) : `Plan #${r.id}`,
      fechaInicio, fechaFin: aFechaIso(r.fechaFin),
      activo: r.activo === true || String(r.activo).toLowerCase() === "true",
      idUsuario: r.id_usuario !== undefined ? Number(r.id_usuario) : r.idUsuario,
      semana: calcularSemanaIso(fechaInicio), dias
    };
  }

  async function listar() {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error(`Error de red: ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error("La API no devolvió una lista de planes.");
    return datos;
  }

  window.planApiServicio = {
    API_URL,
    listar,
    /* Guarda en MockAPI un plan creado en el formulario, con los campos del esquema de la API. */
    async crear(plan) {
      const ahora = new Date().toISOString();
      const cuerpo = {
        nombre: plan.nombre, fechaInicio: plan.fechaInicio, fechaFin: plan.fechaFin, activo: plan.activo,
        id_usuario: plan.idUsuario, dias: plan.dias || {}, fechaCreacion: ahora, fechaActualizacion: ahora
      };
      const respuesta = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json; charset=UTF-8" }, body: JSON.stringify(cuerpo) });
      if (!respuesta.ok) throw new Error(`Error de red: ${respuesta.status}`);
      const guardado = await respuesta.json();
      if (guardado && guardado.id !== undefined) {
        window.planApiServicio.idsCreados.add(String(guardado.id));
        if (plan.id !== undefined) window.planApiServicio.vinculos.set(plan.id, String(guardado.id));
      }
      return guardado;
    },
    /* ID local del plan -> ID del registro que se creó en MockAPI */
    vinculos: new Map(),
    /* Actualiza en MockAPI (PUT) el registro vinculado a un plan local con sus datos actuales, incluidos los días. */
    async actualizar(idLocal, plan) {
      const idApi = window.planApiServicio.vinculos.get(idLocal);
      if (idApi === undefined) return null;
      const cuerpo = {
        nombre: plan.nombre, fechaInicio: plan.fechaInicio, fechaFin: plan.fechaFin, activo: plan.activo,
        id_usuario: plan.idUsuario, dias: plan.dias || {}, fechaActualizacion: new Date().toISOString()
      };
      const respuesta = await fetch(`${API_URL}/${idApi}`, { method: "PUT", headers: { "Content-Type": "application/json; charset=UTF-8" }, body: JSON.stringify(cuerpo) });
      if (!respuesta.ok) throw new Error(`Error de red: ${respuesta.status}`);
      return respuesta.json();
    },
    /* IDs de MockAPI creados desde este formulario (para mostrarlos en el historial) */
    idsCreados: new Set(),
    async obtenerPorSemana(n) {
      const encontrados = (await listar()).map(aPlan).filter((p) => p.semana === n);
      return encontrados.length ? encontrados[encontrados.length - 1] : null;
    }
  };
})();
/* ===== G5-API · fin ===== */