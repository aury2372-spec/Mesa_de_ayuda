const formulario = document.getElementById('formulario');
const selectTecnico = document.getElementById('tecnico');
const mensajeFormulario = document.getElementById('mensajeFormulario');

async function cargarTecnicosEnSelect() {
  try {
    const datos = await pedirJSON('/api/tecnicos');
    selectTecnico.innerHTML = '<option value="">Sin asignar</option>';
    datos.tecnicos.forEach(tecnico => {
      const opcion = document.createElement('option');
      opcion.value = tecnico.id;
      opcion.textContent = `${tecnico.nombre} — ${tecnico.especialidad}`;
      selectTecnico.appendChild(opcion);
    });
  } catch (error) {
    selectTecnico.innerHTML = '<option value="">No se pudieron cargar técnicos</option>';
  }
}

formulario.addEventListener('submit', async event => {
  event.preventDefault();
  mensajeFormulario.textContent = '';
  mensajeFormulario.className = '';
  const body = {
    nombreSolicitante: document.getElementById('nombre').value.trim(),
    titulo: document.getElementById('titulo').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    prioridad: document.getElementById('prioridad').value,
    fecha: document.getElementById('fecha').value || null,
    tecnicoId: selectTecnico.value || null
  };
  if (body.tecnicoId !== null) body.tecnicoId = Number(body.tecnicoId);

  try {
    const datos = await pedirJSON('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    mensajeFormulario.textContent = `Ticket #${datos.ticket.id} creado correctamente.`;
    formulario.reset();
  } catch (error) {
    mensajeFormulario.textContent = `Error: ${error.message}`;
    mensajeFormulario.className = 'error';
  }
});

cargarTecnicosEnSelect();
