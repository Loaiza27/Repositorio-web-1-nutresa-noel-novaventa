const API_URL = 'https://6adfa4d38e42963c8d5e4081.mockapi.io/api/v1'; 

// Consulta de datos a la API
async function obtenerDatosAPI() {
    try {
        const respuesta = await fetch(`${API_URL}/planificador/1`);
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

// Renderizado en el DOM
async function actualizarInterfaz() {
    const contenedor = document.getElementById('contenedor-lista-mercado');
    contenedor.innerHTML = '<li style="color: #6b7280; padding: 0.75rem;">Conectando con la API y consolidando...</li>';

    const datosAPI = await obtenerDatosAPI();

    if (datosAPI) {
        const { listaFinal, itemsEnDespensa } = consolidarLista(datosAPI.ingredientesNecesarios, datosAPI.despensaUsuario);

        document.getElementById('stat-recetas').textContent = datosAPI.recetasPlan;
        document.getElementById('stat-despensa').textContent = itemsEnDespensa;
        document.getElementById('stat-comprar').textContent = listaFinal.length;

        contenedor.innerHTML = '';
        listaFinal.forEach(item => {
            const li = document.createElement('li');
            li.className = 'planificador-lista-item';
            li.style.padding = '0.75rem';
            li.style.backgroundColor = '#f9fafb';
            li.style.border = '1px solid #e5e7eb';
            li.style.borderRadius = '0.375rem';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            
            li.innerHTML = `
                <span style="font-weight: 500; color: #374151;">${item.ingrediente}</span>
                <span style="font-weight: bold; color: #111827;">${item.cantidad} ${item.unidad}</span>
            `;
            contenedor.appendChild(li);
        });
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