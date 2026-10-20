const listaTickets = document.getElementById('listaTickets');
const listaTecnicos = document.getElementById('listaTecnicos');

async function cargarPanel() {
  try {
    const [datosTickets, datosTecnicos] = await Promise.all([
      pedirJSON('/api/tickets'),
      pedirJSON('/api/tecnicos')
    ]);
    const tecnicos = datosTecnicos.tecnicos;
    const porId = new Map(tecnicos.map(t => [t.id, t]));

    // Lista completa de tickets, indicando a qué técnico corresponde cada uno.
    listaTickets.innerHTML = '';
    if (!datosTickets.tickets.length) {
      listaTickets.textContent = 'Aún no hay tickets registrados.';
    } else {
      datosTickets.tickets.forEach(ticket => {
        const tecnico = ticket.tecnicoId === null ? null : porId.get(ticket.tecnicoId);
        listaTickets.appendChild(crearTarjetaTicket(ticket, textoDeTecnico(tecnico)));
      });
    }

    // Lista de técnicos con su cantidad de tickets.
    listaTecnicos.innerHTML = '';
    if (!tecnicos.length) {
      listaTecnicos.textContent = 'Aún no hay técnicos registrados.';
    } else {
      tecnicos.forEach(tecnico => {
        const cantidad = datosTickets.tickets.filter(t => t.tecnicoId === tecnico.id).length;
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tecnico';
        const titulo = document.createElement('h3');
        titulo.textContent = `${tecnico.nombre} (#${tecnico.id})`;
        tarjeta.append(
          titulo,
          crearParrafo('Especialidad', tecnico.especialidad),
          crearParrafo('Estado', tecnico.estado),
          crearParrafo('Tickets asignados', String(cantidad))
        );
        listaTecnicos.appendChild(tarjeta);
      });
    }
  } catch (error) {
    listaTickets.textContent = `Error: ${error.message}`;
    listaTecnicos.textContent = '';
  }
}

protegerVista('admin', cargarPanel);
