// 1. Datos simulados del Backend
const recetasPlan = 4;
const despensaUsuario = [
    { ingrediente: 'Arroz integral', cantidad: 1 }, // El usuario ya tiene 1 kg
    { ingrediente: 'Espinacas tiernas', cantidad: 200 } // El usuario ya tiene 200 g
];

const ingredientesNecesarios = [
    { ingrediente: 'Pollo / Pechuga fresca', cantidad: 2, unidad: 'kg' },
    { ingrediente: 'Arroz integral', cantidad: 1, unidad: 'kg' },
    { ingrediente: 'Espinacas tiernas', cantidad: 500, unidad: 'g' },
    { ingrediente: 'Tomate chonto', cantidad: 3, unidad: 'kg' }];

// 2. Módulo de Lógica Pura: Algoritmo de resta de ingredientes
function consolidarLista(necesarios, despensa) {
    let listaFinal = [];
    let itemsEnDespensa = 0;

    necesarios.forEach(req => {
        // Buscar si el ingrediente ya existe en la despensa del usuario
        const enDespensa = despensa.find(item => item.ingrediente === req.ingrediente);

        if (enDespensa) {
            const cantidadFaltante = req.cantidad - enDespensa.cantidad;
            if (cantidadFaltante > 0) {
                listaFinal.push({ ingrediente: req.ingrediente, cantidad: cantidadFaltante, unidad: req.unidad });
            }
            itemsEnDespensa++;
        } else {
            // Si no está en la despensa, se debe comprar completo
            listaFinal.push(req);
        }
    });

    return { listaFinal, itemsEnDespensa };
}

// 3. Renderizado y actualización dinámica del DOM
function actualizarInterfaz() {
    const contenedor = document.getElementById('contenedor-lista-mercado');
    contenedor.innerHTML = '<li style="color: #6b7280;">Consolidando ingredientes...</li>';

    setTimeout(() => {
        // Ejecutar el algoritmo
        const { listaFinal, itemsEnDespensa } = consolidarLista(ingredientesNecesarios, despensaUsuario);

        // Actualizar métricas del panel superior (HU 5.3.3)
        document.getElementById('stat-recetas').textContent = recetasPlan;
        document.getElementById('stat-despensa').textContent = itemsEnDespensa;
        document.getElementById('stat-comprar').textContent = listaFinal.length;

        // Limpiar y renderizar la lista final
        contenedor.innerHTML = '';
        listaFinal.forEach(item => {
            const li = document.createElement('li');
            li.className = 'planificador-lista-item';
            // Estilos en línea aplicados mediante JS para mantener el diseño
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
    }, 600); // Simulando el "await" de un servidor real
}

// Inicializar la vista
document.addEventListener('DOMContentLoaded', actualizarInterfaz);

// HU 5.3.2: Botón Generar Lista con alerta
document.getElementById('btn-generar').addEventListener('click', () => {
    const alerta = document.getElementById('alerta-exito');
    alerta.classList.remove('hidden');
    
    // Forzar una re-consolidación visual
    actualizarInterfaz();

    setTimeout(() => {
        alerta.classList.add('hidden');
    }, 3000);
});