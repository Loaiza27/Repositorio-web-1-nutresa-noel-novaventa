const API_URL = 'https://6adfa4d38e42963c8d5e4081.mockapi.io/api/v1'; 

// Consulta de datos a la API
async function obtenerDatosAPI() {
    try {
        const respuesta = await fetch(`${API_URL}/planificador/1`);
                if (!respuesta.ok) throw new Error(`Error de red: ${respuesta.status}`);
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error("Error conectando a la API:", error);
        return null;
    }
}

// Algoritmo de consolidación de ingredientes
function consolidarLista(necesarios, despensa) {
    let listaFinal = [];
    let itemsEnDespensa = 0;

    necesarios.forEach(req => {
        const enDespensa = despensa.find(item => item.ingrediente === req.ingrediente);
        if (enDespensa) {
            const cantidadFaltante = req.cantidad - enDespensa.cantidad;
            if (cantidadFaltante > 0) {
                listaFinal.push({ ingrediente: req.ingrediente, cantidad: cantidadFaltante, unidad: req.unidad });
            }
            itemsEnDespensa++;
        } else {
            listaFinal.push(req);
        }
    });

    return { listaFinal, itemsEnDespensa };
}

// ===== G5-CHK · inicio =====
let datosActuales = null;

async function guardarCompradosAPI(lista) {
    guardarComprados(lista); // respaldo local
    if (!datosActuales) return; // sin datos cargados no se escribe nada
    try {
        const respuesta = await fetch(`${API_URL}/planificador/1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...datosActuales, comprados: lista })
        });
        if (!respuesta.ok) throw new Error(`Error de red: ${respuesta.status}`);
        datosActuales = await respuesta.json();
    } catch (error) {
        console.error('No se pudo guardar en MockAPI:', error);
    }
}
const CLAVE_COMPRADOS = 'planificador-comprados';

function leerComprados() {
    try { return JSON.parse(localStorage.getItem(CLAVE_COMPRADOS)) || []; }
    catch (error) { return []; }
}

function guardarComprados(lista) {
    localStorage.setItem(CLAVE_COMPRADOS, JSON.stringify(lista));
}

function crearItemLista(item, indice, comprados) {
    const li = document.createElement('li');
    li.className = 'planificador-lista-item';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.id = `planificador-item-${indice}`;
    check.checked = comprados.includes(item.ingrediente);

    const label = document.createElement('label');
    label.htmlFor = check.id;
    const nombre = document.createElement('span');
    nombre.textContent = item.ingrediente;
    const cantidad = document.createElement('strong');
    cantidad.textContent = `${item.cantidad} ${item.unidad}`;
    label.append(nombre, cantidad);

    const aplicarEstado = () => {
        li.classList.toggle('planificador-item-comprado', check.checked);
        label.classList.toggle('planificador-item-tachado', check.checked);
    };

    check.addEventListener('change', () => {
        aplicarEstado();
        const actuales = leerComprados().filter(n => n !== item.ingrediente);
        if (check.checked) actuales.push(item.ingrediente);
        guardarCompradosAPI(actuales);
    });

    aplicarEstado();
    li.append(check, label);
    return li;
}
// ===== G5-CHK · fin =====

// Renderizado en el DOM
async function actualizarInterfaz() {
    const contenedor = document.getElementById('contenedor-lista-mercado');
    contenedor.innerHTML = '<li style="color: #6b7280; padding: 0.75rem;">Conectando con la API y consolidando...</li>';

    const datosAPI = await obtenerDatosAPI();
        datosActuales = datosAPI;

    if (datosAPI) {
        const { listaFinal, itemsEnDespensa } = consolidarLista(datosAPI.ingredientesNecesarios, datosAPI.despensaUsuario);

        document.getElementById('stat-recetas').textContent = datosAPI.recetasPlan;
        document.getElementById('stat-despensa').textContent = itemsEnDespensa;
        document.getElementById('stat-comprar').textContent = listaFinal.length;

        contenedor.innerHTML = '';
        const comprados = Array.isArray(datosAPI.comprados) ? datosAPI.comprados : leerComprados();
        listaFinal.forEach((item, i) => contenedor.appendChild(crearItemLista(item, i, comprados)));
        
    }
}

document.addEventListener('DOMContentLoaded', actualizarInterfaz);

document.getElementById('btn-generar').addEventListener('click', () => {
    const alerta = document.getElementById('alerta-exito');
    alerta.classList.remove('hidden');
    actualizarInterfaz();
    
    setTimeout(() => {
        alerta.classList.add('hidden');
    }, 3000);
});