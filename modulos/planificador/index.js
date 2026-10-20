(function () {
  async function iniciarPlanificador() {
    var estado = document.getElementById("planificador-estado");
    if (!estado) {
      return;
    }
    try {
      await window.planificadorServicio.listarTodos();
      estado.textContent = "Estructura base del módulo planificador cargada.";
    } catch (error) {
      estado.setAttribute("role", "alert");
      estado.textContent = "No fue posible cargar la base de planificador.";
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", iniciarPlanificador);
})();

// ===== G5-COM · ComidaPlanificada · inicio =====
(function () {
  const ID_PLAN_SEMANAL = 1;
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const TIPOS = ["Desayuno", "Almuerzo", "Merienda", "Cena"];

  const form = document.getElementById("formComida");
  const selDia = document.getElementById("diaSemana");
  const selTipo = document.getElementById("tipoComida");
  const selReceta = document.getElementById("idReceta");
  const inpPorciones = document.getElementById("porciones");
  const mensaje = document.getElementById("mensaje");
  const semana = document.getElementById("semana");

  let recetas = [];

  function llenarSelect(select, valores) {
    valores.forEach((v) => select.add(new Option(v, v)));
  }

  function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("planificador-mensaje-error", Boolean(esError));
  }

  function nombreReceta(id) {
    const r = recetas.find((x) => x.id === id);
    return r ? r.nombre : "Receta #" + id;
  }

  function crear(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function tarjetaComida(c) {
    const li = crear("li", "comida-item");
    li.appendChild(crear("strong", "", c.tipoComida));
    li.appendChild(crear("span", "comida-receta", nombreReceta(c.idReceta)));
    li.appendChild(crear("span", "comida-porciones", c.porciones + (c.porciones === 1 ? " porción" : " porciones")));

    const quitar = crear("button", "comida-quitar", "Quitar");
    quitar.type = "button";
    quitar.setAttribute("aria-label", `Quitar ${c.tipoComida} del ${c.díaSemana}`);
    quitar.addEventListener("click", () => quitarComida(c.id));
    li.appendChild(quitar);
    return li;
  }

  async function pintarSemana() {
    const comidas = await PlanificadorServicio.listarComidas(ID_PLAN_SEMANAL);
    semana.replaceChildren();

    DIAS.forEach((dia) => {
      const delDia = comidas
        .filter((c) => c.díaSemana === dia)
        .sort((a, b) => TIPOS.indexOf(a.tipoComida) - TIPOS.indexOf(b.tipoComida));

      const dEl = crear("article", "dia-card");
      dEl.appendChild(crear("h3", "", dia));

      if (delDia.length === 0) {
        dEl.appendChild(crear("p", "dia-vacio", "Sin comidas planificadas."));
      } else {
        const ul = crear("ul", "comidas-lista");
        delDia.forEach((c) => ul.appendChild(tarjetaComida(c)));
        dEl.appendChild(ul);
      }
      semana.appendChild(dEl);
    });
  }

  async function quitarComida(id) {
    try {
      await PlanificadorServicio.eliminarComida(id);
      avisar("Comida quitada del plan.");
      await pintarSemana();
    } catch (e) {
      avisar(e.message, true);
    }
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const porciones = parseInt(inpPorciones.value, 10);

    if (!selReceta.value) return avisar("Selecciona una receta.", true);
    if (!porciones || porciones < 1) return avisar("Las porciones deben ser al menos 1.", true);

    // Mismos nombres que la clase ComidaPlanificada
    const payload = {
      díaSemana: selDia.value,
      tipoComida: selTipo.value,
      porciones: porciones,
      idReceta: Number(selReceta.value),
      idPlanSemanal: ID_PLAN_SEMANAL
    };

    try {
      await PlanificadorServicio.planificarComida(payload);
      avisar(`Agregado: ${payload.tipoComida} del ${payload.díaSemana}.`);
      await pintarSemana();
    } catch (e) {
      avisar(e.message, true);
    }
  });

  async function iniciar() {
    llenarSelect(selDia, DIAS);
    llenarSelect(selTipo, TIPOS);
    try {
      recetas = await PlanificadorServicio.listarRecetas();
      recetas.forEach((r) => selReceta.add(new Option(r.nombre, r.id)));
      await pintarSemana();
    } catch (e) {
      avisar("No se pudo cargar el planificador: " + e.message, true);
    }
  }

  iniciar();
})();

// ===== G5-COM · ComidaPlanificada · fin =====