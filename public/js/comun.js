// Funciones compartidas por las tres vistas.
// ---------- Sesión (token guardado solo en esta pestaña) ----------
let tokenMemoria = null;
function obtenerToken() {
  try { return sessionStorage.getItem('token') || tokenMemoria; } catch (e) { return tokenMemoria; }
}
function guardarToken(token) {
  tokenMemoria = token;
  try {
    if (token) sessionStorage.setItem('token', token); else sessionStorage.removeItem('token');
  } catch (e) { /* sin almacenamiento: se usa solo la memoria */ }
}

async function pedirJSON(url, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  const token = obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const respuesta = await fetch(url, { ...opciones, headers });
  let datos;
  try {
    datos = await respuesta.json();
  } catch (error) {
    throw new Error('El servidor no respondió con JSON válido. Verifique que la API esté activa.');
  }
  if (respuesta.status === 401 && token) { // sesión vencida o inválida
    guardarToken(null);
    location.reload();
  }
  if (!respuesta.ok) throw new Error(datos.mensaje || 'La solicitud no se pudo completar.');
  return datos;
}

// Muestra el contenido de la vista solo si hay una sesión válida para ese rol;
// de lo contrario pide la contraseña. Requiere #acceso, #formAcceso, #clave,
// #mensajeAcceso, #contenido y #btnSalir en la página.
async function protegerVista(rol, iniciar) {
  const acceso = document.getElementById('acceso');
  const contenido = document.getElementById('contenido');
  const mostrar = () => { acceso.hidden = true; contenido.hidden = false; iniciar(); };

  document.getElementById('btnSalir').addEventListener('click', async () => {
    try { await pedirJSON('/api/salir', { method: 'POST' }); } catch (e) { /* ignorar */ }
    guardarToken(null);
    location.href = '/';
  });

  if (obtenerToken()) {
    try {
      const datos = await pedirJSON('/api/sesion');
      if (datos.rol === rol || datos.rol === 'admin') return mostrar();
    } catch (e) { /* sin sesión válida: se pide la contraseña */ }
  }

  acceso.hidden = false;
  document.getElementById('formAcceso').addEventListener('submit', async event => {
    event.preventDefault();
    const mensaje = document.getElementById('mensajeAcceso');
    mensaje.textContent = '';
    try {
      const datos = await pedirJSON('/api/acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol, clave: document.getElementById('clave').value })
      });
      guardarToken(datos.token);
      mostrar();
    } catch (error) {
      mensaje.textContent = error.message;
    }
  });
}

function crearParrafo(etiqueta, valor) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `${etiqueta}: `;
  p.append(strong, document.createTextNode(valor ?? 'No especificado'));
  return p;
}

// textoTecnico: texto a mostrar en la línea "Técnico". Si es null, la línea se omite.
function crearTarjetaTicket(ticket, textoTecnico) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'ticket';
  const titulo = document.createElement('h3');
  titulo.textContent = `#${ticket.id} — ${ticket.titulo}`;
  tarjeta.appendChild(titulo);
  tarjeta.append(
    crearParrafo('Solicitante', ticket.nombreSolicitante),
    crearParrafo('Descripción', ticket.descripcion),
    crearParrafo('Prioridad', ticket.prioridad),
    crearParrafo('Estado', ticket.estado)
  );
  if (textoTecnico !== null) tarjeta.appendChild(crearParrafo('Técnico', textoTecnico));
  tarjeta.appendChild(crearParrafo('Fecha solicitada', ticket.fecha || 'No indicada'));
  return tarjeta;
}

function textoDeTecnico(tecnico) {
  return tecnico ? `${tecnico.nombre} — ${tecnico.especialidad}` : 'Sin asignar';
}
