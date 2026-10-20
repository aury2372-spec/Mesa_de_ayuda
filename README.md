# Mesa de Ayuda Técnica

**Caso de uso asignado:** Caso 3 — Mesa de ayuda técnica
**Asignatura:** Programación Aplicada · Proyecto integrador

## Integrantes
- DANILO ANDRÉS ARMENTA VANEGAS
- AURY JULIANA IMBUS BELTRAN
- JUAN ANDRES MAHECHA GRAJALES
- JUAN DAVID TAPIAS ARCILA
- ANGIE LORENA PARRA GOMEZ

## Descripción
Aplicación web para registrar y dar seguimiento a solicitudes de soporte técnico (tickets). Un usuario crea un ticket con su prioridad (baja, media o alta); un técnico lo atiende y el administrador gestiona los tickets y los técnicos. Cada ticket pasa por los estados **abierto**, **en atención** y **cerrado**.

El backend está hecho con **Node.js y Express** y expone una API REST que responde en formato JSON. Los datos se guardan en memoria, así que se pierden al reiniciar el servidor.

## Enlaces
- **Aplicación en Render:** https://mesa-de-ayuda-97dj.onrender.com/
- **Repositorio en GitHub:** https://github.com/aury2372-spec/Mesa_de_ayuda 

## Vistas de la aplicación
| Ruta | Quién la usa | Qué hace |
|---|---|---|
| `/` | Usuario | Crear tickets |
| `/tecnico` | Técnico | Ver tickets por técnico y añadir técnicos |
| `/admin` | Administrador | Ver todos los tickets y gestionar técnicos |

Las vistas de técnico y administrador piden contraseña:

| Rol | Contraseña por defecto |
|---|---|
| Técnico | `tecnico123` |
| Administrador | `admin123` |

## Endpoints disponibles

**Quién puede usarlos:** *Público* = sin contraseña · *Técnico* = sesión de técnico o admin · *Admin* = solo administrador.

### Acceso
| Método | Ruta | Qué hace | Acceso |
|---|---|---|---|
| POST | `/api/acceso` | Inicia sesión y devuelve un token | Público |
| GET | `/api/sesion` | Verifica la sesión | Técnico |
| POST | `/api/salir` | Cierra la sesión | Público |

### Tickets
| Método | Ruta | Qué hace | Acceso |
|---|---|---|---|
| POST | `/api/tickets` | Crea un ticket | Público |
| GET | `/api/tickets` | Lista tickets (filtros `?estado=` y `?prioridad=`) | Admin |
| GET | `/api/tickets/:id` | Consulta un ticket por id | Técnico |
| PUT | `/api/tickets/:id` | Edita un ticket (prioridad, estado, etc.) | Técnico |
| PATCH | `/api/tickets/:id/cerrar` | Cierra un ticket | Público |
| PATCH | `/api/tickets/:id/asignar` | Asigna un técnico al ticket | Público |

### Técnicos
| Método | Ruta | Qué hace | Acceso |
|---|---|---|---|
| GET | `/api/tecnicos` | Lista los técnicos | Público |
| GET | `/api/tecnicos/:id` | Consulta un técnico por id | Técnico |
| POST | `/api/tecnicos` | Crea un técnico | Técnico |
| PUT | `/api/tecnicos/:id` | Edita un técnico | Admin |
| DELETE | `/api/tecnicos/:id` | Elimina un técnico (si no tiene tickets) | Admin |
| GET | `/api/tecnicos/:id/tickets` | Lista los tickets de un técnico | Técnico |

## Cómo probar cada endpoint

Primero define la dirección base. Si lo pruebas en tu equipo usa `http://localhost:3000`; si usas la versión publicada, usa la URL de Render.

```bash
URL=http://localhost:3000
```

### 1. Iniciar sesión (para las rutas protegidas)
```bash
curl -X POST $URL/api/acceso \
  -H "Content-Type: application/json" \
  -d '{"rol":"admin","clave":"admin123"}'
```
La respuesta trae un `token`. Guárdalo así (cambia `TOKEN_AQUI` por el valor recibido):
```bash
TOKEN=TOKEN_AQUI
```
Las rutas protegidas se prueban agregando `-H "Authorization: Bearer $TOKEN"`.

### 2. Verificar la sesión
```bash
curl $URL/api/sesion -H "Authorization: Bearer $TOKEN"
```

### 3. Crear un técnico
```bash
curl -X POST $URL/api/tecnicos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Pérez","especialidad":"Redes","estado":"Disponible"}'
```

### 4. Listar técnicos
```bash
curl $URL/api/tecnicos
```

### 5. Consultar un técnico
```bash
curl $URL/api/tecnicos/1 -H "Authorization: Bearer $TOKEN"
```

### 6. Editar un técnico (solo admin)
```bash
curl -X PUT $URL/api/tecnicos/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Pérez","especialidad":"Hardware","estado":"Ocupado"}'
```

### 7. Crear un ticket
```bash
curl -X POST $URL/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"nombreSolicitante":"Luis","titulo":"No enciende el PC","descripcion":"Al presionar el botón no pasa nada","prioridad":"alta"}'
```

### 8. Listar tickets (solo admin)
```bash
curl $URL/api/tickets -H "Authorization: Bearer $TOKEN"
```
Con filtros:
```bash
curl "$URL/api/tickets?estado=abierto" -H "Authorization: Bearer $TOKEN"
curl "$URL/api/tickets?prioridad=alta" -H "Authorization: Bearer $TOKEN"
```

### 9. Consultar un ticket
```bash
curl $URL/api/tickets/1 -H "Authorization: Bearer $TOKEN"
```

### 10. Editar un ticket (cambiar prioridad y estado)
```bash
curl -X PUT $URL/api/tickets/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"prioridad":"media","estado":"en atención"}'
```

### 11. Asignar un ticket a un técnico
```bash
curl -X PATCH $URL/api/tickets/1/asignar \
  -H "Content-Type: application/json" \
  -d '{"tecnicoId":1}'
```

### 12. Ver los tickets de un técnico
```bash
curl $URL/api/tecnicos/1/tickets -H "Authorization: Bearer $TOKEN"
```

### 13. Cerrar un ticket
```bash
curl -X PATCH $URL/api/tickets/1/cerrar
```

### 14. Eliminar un técnico (solo admin)
```bash
curl -X DELETE $URL/api/tecnicos/1 -H "Authorization: Bearer $TOKEN"
```
Si el técnico tiene tickets asignados, la API responde `400` y pide reasignarlos antes.

### 15. Cerrar sesión
```bash
curl -X POST $URL/api/salir -H "Authorization: Bearer $TOKEN"
```

### Códigos de respuesta
| Código | Significado |
|---|---|
| 200 | Operación correcta |
| 201 | Registro creado |
| 400 | Datos inválidos o incompletos |
| 401 | Falta iniciar sesión o la contraseña es incorrecta |
| 404 | El id o la ruta no existen |
