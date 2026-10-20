const lista = document.getElementById('listaTecnicos');
const form = document.getElementById('formTecnico');
const mensaje = document.getElementById('mensaje');
const panelTickets = document.getElementById('panelTickets');
const tituloTickets = document.getElementById('tituloTickets');
const listaTickets = document.getElementById('listaTickets');
let tecnicoSeleccionado = null;

async function cargarTecnicos() {
  try {
    const datos = await pedirJSON('/api/tecnicos');
    lista.innerHTML = '';
    if (!datos.tecnicos.length) {
      lista.textContent = 'No hay técnicos registrados. Añade uno con el formulario.';
      return;
    }
    datos.tecnicos.forEach(tecnico => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tecnico' + (tecnico.id === tecnicoSeleccionado ? ' activo' : '');
      const titulo = document.createElement('h3');
      titulo.textContent = `${tecnico.nombre} (#${tecnico.id})`;
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = 'Ver tickets';
      boton.addEventListener('click', () => seleccionarTecnico(tecnico));
      tarjeta.append(
        titulo,
        crearParrafo('Especialidad', tecnico.especialidad),
        crearParrafo('Estado', tecnico.estado),
        boton
      );
      lista.appendChild(tarjeta);
    });
  } catch (error) {
    lista.textContent = `Error: ${error.message}`;
  }
}

async function seleccionarTecnico(tecnico) {
  tecnicoSeleccionado = tecnico.id;
  panelTickets.hidden = false;
  tituloTickets.textContent = `Tickets de ${tecnico.nombre}`;
  listaTickets.textContent = 'Cargando tickets...';
  cargarTecnicos();
  try {
    const datos = await pedirJSON(`/api/tecnicos/${tecnico.id}/tickets`);
    listaTickets.innerHTML = '';
    if (!datos.tickets.length) {
      listaTickets.textContent = 'Este técnico no tiene tickets asignados.';
    } else {
      datos.tickets.forEach(ticket => listaTickets.appendChild(crearTarjetaTicket(ticket, null)));
    }
  } catch (error) {
    listaTickets.textContent = `Error: ${error.message}`;
  }
  panelTickets.scrollIntoView({ behavior: 'smooth' });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  mensaje.className = '';
  const body = {
    nombre: document.getElementById('nombreTecnico').value.trim(),
    especialidad: document.getElementById('especialidad').value.trim(),
    estado: document.getElementById('estadoTecnico').value
  };
  try {
    await pedirJSON('/api/tecnicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    mensaje.textContent = 'Técnico añadido correctamente.';
    form.reset();
    await cargarTecnicos();
  } catch (error) {
    mensaje.textContent = `Error: ${error.message}`;
    mensaje.className = 'error';
  }
});

protegerVista('tecnico', cargarTecnicos);
