// Simulación del servicio para que puedas probar la vista localmente
const planServicio = {
    obtenerListaMercado: async (idPlan) => {
        // Simula la espera del servidor
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { ingrediente: 'Pollo / Pechuga fresca', cantidad: '2 kg' },
            { ingrediente: 'Arroz integral', cantidad: '1 kg' },
            { ingrediente: 'Espinacas tiernas', cantidad: '500 g' },
            { ingrediente: 'Tomate chonto (con tilde y eñe para probar UTF-8)', cantidad: '3 kg' }
        ];
    }
};

async function renderizarListaMercado(idPlan) {
    const contenedor = document.getElementById('contenedor-lista-mercado');
    contenedor.innerHTML = '<li class="text-gray-500">Consolidando ingredientes...</li>';

    try {
        // Criterio 1: Consumo asíncrono con await
        const lista = await planServicio.obtenerListaMercado(idPlan);
        contenedor.innerHTML = ''; 

        if (lista.length === 0) {
            contenedor.innerHTML = '<li class="text-gray-500">No hay ingredientes en este plan.</li>';
            return;
        }

        // Criterio 2: Marcado semántico con clase prefijada
        lista.forEach(item => {
            const li = document.createElement('li');
            li.className = 'planificador-lista-item p-3 bg-gray-50 border border-gray-200 rounded flex justify-between'; 
            
            li.innerHTML = `
                <span class="font-medium text-gray-700">${item.ingrediente}</span>
                <span class="font-bold text-gray-900">${item.cantidad}</span>
            `;
            contenedor.appendChild(li);
        });

    } catch (error) {
        // Criterio 1: Manejo de errores con catch
        console.error('Error al obtener la lista de mercado:', error);
        contenedor.innerHTML = '<li class="text-red-600 font-bold">Error al cargar los datos. Intente nuevamente.</li>';
    }
}

// Ejecutar la función al cargar la página (usando un ID de prueba)
document.addEventListener('DOMContentLoaded', () => {
    renderizarListaMercado(101);
});

document.getElementById('btn-generar').addEventListener('click', () => {
    const alerta = document.getElementById('alerta-exito');
    alerta.classList.remove('hidden');
    
    setTimeout(() => {
        alerta.classList.add('hidden');
    }, 3000);
});