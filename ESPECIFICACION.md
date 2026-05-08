# Especificación del Proyecto: Sistema de Gestión Académica con Rúbricas de Evaluación

---

# Historias de usuario

## Administrador

---

**HU-01 — Gestionar usuarios**
**Actor:** Administrador

*Como administrador, quiero gestionar los usuarios del sistema (docentes y estudiantes) para mantener actualizado el registro de personas con acceso a la plataforma.*

Criterios de aceptación:
1. El administrador puede crear, editar y desactivar cuentas de usuario.
2. Al crear un usuario se valida que el correo institucional no esté duplicado.
3. El administrador puede filtrar usuarios por rol, carrera o estado (activo/inactivo).

---

**HU-02 — Gestionar carreras y semestres**
**Actor:** Administrador

*Como administrador, quiero gestionar carreras y semestres para estructurar la oferta académica del sistema.*

Criterios de aceptación:
1. Se pueden crear, editar y archivar carreras con nombre y código único.
2. Los semestres tienen fecha de inicio, fecha de fin y estado (activo/cerrado).
3. No se puede eliminar una carrera que tenga estudiantes matriculados.
4. Solo puede haber un semestre activo a la vez por carrera.

---

**HU-03 — Gestionar plan de estudios**
**Actor:** Administrador

*Como administrador, quiero gestionar el plan de estudios de cada carrera para definir qué asignaturas la conforman y en qué semestre se cursan.*

Criterios de aceptación:
1. Se pueden agregar o remover asignaturas del plan de estudios de una carrera.
2. Cada asignatura en el plan tiene un semestre sugerido y créditos asociados.
3. Los cambios al plan solo aplican a nuevas cohortes, no a estudiantes ya matriculados.
4. Se puede consultar el histórico de versiones del plan de estudios.

---
**HU-04 — Gestionar asignaturas**
**Actor:** Administrador

*Como administrador, quiero gestionar las asignaturas del sistema para mantener actualizado el catálogo de materias disponibles que pueden integrarse en los planes de estudio.*

Criterios de aceptación:
1. Se puede crear una asignatura ingresando nombre, código único, descripción y número de créditos.
2. No se pueden crear dos asignaturas con el mismo código.
3. Una asignatura archivada no puede asociarse a nuevos grupos ni a nuevas versiones de un plan de estudios.

---

**HU-05 — Asignar docente a grupo**
**Actor:** Administrador

*Como administrador, quiero asignar docentes a grupos de clase asociados a una asignatura para que puedan gestionar sus grupos y registrar evaluaciones en el sistema.*

Criterios de aceptación:
1. Se puede asignar un docente a un grupo en un semestre activo, indicando la asignatura que el grupo imparte.
2. Un grupo debe tener definida su asignatura antes de poder asignarle un docente.
---

**HU-06 — Matricular estudiante**
**Actor:** Administrador

*Como administrador, quiero matricular estudiantes en las asignaturas de su carrera para que queden inscritos en los grupos correspondientes.*

Criterios de aceptación:
1. Se puede matricular un estudiante en una o varias asignaturas del semestre activo.
2. Se genera un registro de matrícula con fecha y estado.
3. El administrador puede cancelar una matrícula antes del cierre del semestre.

**HU-07 — Inscribir estudiante en grupo**
**Actor:** Administrador

*Como administrador, quiero inscribir estudiantes en los grupos de las asignaturas del semestre activo para que queden vinculados a los docentes y evaluaciones correspondientes.*

Criterios de aceptación:
1. Solo se puede inscribir a un estudiante que tenga una matrícula activa en una carrera.
2. El estudiante solo puede inscribirse en grupos cuya asignatura pertenezca al plan de estudios de su carrera.
3. No se puede inscribir al mismo estudiante dos veces en el mismo grupo.

---

## Docente

---

**HU-08 — Crear rúbrica de evaluación**
**Actor:** Docente

*Como docente, quiero crear rúbricas de evaluación con criterios y escalas para tener un instrumento estructurado con el que calificar a mis estudiantes.*

Criterios de aceptación:
1. Una rúbrica tiene nombre, descripción y está asociada a una asignatura.
2. El docente puede agregar múltiples criterios a la rúbrica.
3. Cada criterio tiene nombre, descripción y peso porcentual.
4. Los pesos de todos los criterios deben sumar exactamente 100%.
5. Se puede guardar la rúbrica como borrador antes de publicarla.
6. Una rúbrica publicada no puede eliminarse, solo archivarse.

---

**HU-09 — Definir criterios y escalas**
**Actor:** Docente

*Como docente, quiero definir escalas de calificación para cada criterio de la rúbrica para que los niveles de desempeño sean claros y medibles.*

Criterios de aceptación:
1. Cada criterio tiene entre 2 y 5 niveles de escala (ej. Insuficiente, Básico, Satisfactorio, Excelente).
2. Cada nivel tiene etiqueta, descripción y valor numérico.
3. Los valores numéricos deben ser únicos dentro del mismo criterio.
4. Se puede reutilizar una escala definida previamente en otros criterios.

---

**HU-10 — Asociar rúbrica a evaluación**
**Actor:** Docente

*Como docente, quiero asociar una rúbrica a una evaluación concreta para que quede claro qué instrumento se usará en cada actividad evaluativa.*

Criterios de aceptación:
1. Una evaluación puede tener asociada una sola rúbrica.
2. Solo se pueden asociar rúbricas publicadas.
3. Una rúbrica puede estar asociada a múltiples evaluaciones.

---

**HU-11— Calificar estudiante con rúbrica**
**Actor:** Docente

*Como docente, quiero calificar a cada estudiante usando la rúbrica asociada a la evaluación para registrar su desempeño por criterio de forma objetiva.*

Criterios de aceptación:
1. El docente selecciona el nivel de escala para cada criterio por cada estudiante.
2. La nota se calcula automáticamente ponderando los criterios.
3. Se puede guardar la calificación parcialmente y completarla después.
4. El docente puede agregar comentarios por criterio.

---

**HU-12 — Registrar nota final**
**Actor:** Docente

*Como docente, quiero registrar la nota final de cada estudiante para que quede como registro oficial en el semestre.*

Criterios de aceptación:
1. La nota final se calcula como suma ponderada de todas las evaluaciones del grupo.
2. El docente puede revisar y confirmar la nota antes de registrarla oficialmente.
3. El sistema genera un reporte de notas del grupo en formato descargable en pdf.

---

## Estudiante

---

**HU-13 — Consultar rúbrica de evaluación**
**Actor:** Estudiante

*Como estudiante, quiero consultar la rúbrica de una actividad antes de realizarla para saber con qué criterios seré calificado.*

Criterios de aceptación:
1. El estudiante puede ver las rúbricas de las evaluaciones de sus asignaturas activas.
2. Se muestran todos los criterios con su peso y los niveles de escala con descripción.
3. La rúbrica es de solo lectura para el estudiante.
4. Se muestra la fecha de publicación de la rúbrica.

---

**HU-14 — Ver calificaciones detalladas**
**Actor:** Estudiante

*Como estudiante, quiero ver mis calificaciones detalladas por criterio en cada evaluación para entender en qué aspectos debo mejorar.*

Criterios de aceptación:
1. El estudiante puede ver el nivel obtenido y el puntaje en cada criterio.
2. Se muestra la nota final calculada junto con el desglose por evaluación.
3. Se visualizan los comentarios del docente por criterio si los hay.
4. El estudiante puede descargar un reporte de su desempeño.

---

# Especificación de casos de uso

---

## CU-01 — Gestionar usuarios

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-01 – Gestionar usuarios |
| **Actor(es)** | Administrador |
| **Descripción** | Permite al administrador crear, consultar, editar y desactivar cuentas de usuario en el sistema. |
| **Entidades involucradas** | `User`, `Docente`, `Estudiante` |
| **Precondiciones** | El administrador ha iniciado sesión. El `email` del nuevo usuario no existe en el sistema. |
| **Postcondiciones** | El registro `User` queda creado, modificado o con `is_active = false`. Se genera log de auditoría con `created_at` / `updated_at`. |
| **Flujo principal** | 1. El administrador accede al módulo de usuarios. 2. Selecciona la acción: Crear / Editar / Desactivar. 3. Para **crear**: ingresa `email`, `password`, `codigo`, `rol` (UserRole) y datos del perfil según rol: si es docente → `nombre`, `apellido`, `telefono`, `cedula`, `especialidad`; si es estudiante → `nombre`, `apellido`, `cedula`. 4. El sistema valida unicidad de `email` y `codigo`, y crea el `User` vinculado al perfil (`user_id`). 5. Para **editar**: modifica cualquier campo salvo `id`. 6. Para **desactivar**: establece `is_active = false` sin eliminar el registro.  |
| **Flujos alternativos** | 2a. Si selecciona Buscar, puede filtrar por `rol`, `carrera_id` (vía `Matricula`) o `is_active` antes de editar. |
| **Excepciones** | E1: `email` duplicado → operación rechazada, se solicita uno diferente. E2: `codigo` duplicado → operación rechazada. E3: Campos obligatorios vacíos (`email`, `password`, `rol`) → el sistema resalta los campos faltantes. |

---

## CU-02 — Gestionar carreras y semestres

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-02 – Gestionar carreras y semestres |
| **Actor(es)** | Administrador |
| **Descripción** | Permite crear y administrar las entidades `Carrera` y `Semestre`. |
| **Entidades involucradas** | `Carrera`, `Semestre` |
| **Precondiciones** | El administrador ha iniciado sesión. |
| **Postcondiciones** | `Carrera` o `Semestre` queda creado, actualizado o archivado. Se actualiza `updated_at`. |
| **Flujo principal** | 1. El administrador accede al módulo académico. 2. **Para Carrera**: ingresa `nombre`, `codigo` (único), `descripcion`; el sistema asigna `id` (uuid) y `created_at`. 3. **Para Semestre**: ingresa `nombre`, `codigo`, `fecha_inicio`, `fecha_fin`; el sistema establece `estado = true` si es el activo. 4. El sistema valida unicidad de `codigo` (en Carrera) y que `fecha_inicio < fecha_fin` (en Semestre). 5. Confirma y persiste el registro. |
| **Flujos alternativos** | 3a. Para archivar una `Carrera`, el sistema verifica que no exista ningún `Semestre` con `estado = true` asociado a ella antes de proceder. 3b. Solo puede haber un `Semestre` con `estado = true` a la vez; al activar uno nuevo el sistema pone `estado = false` en el anterior. |
| **Excepciones** | E1: `codigo` de carrera duplicado → operación rechazada. E2: `fecha_inicio >= fecha_fin` → el sistema lo indica y bloquea el guardado. |

---

## CU-03 — Gestionar plan de estudios

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-03 – Gestionar plan de estudios |
| **Actor(es)** | Administrador |
| **Descripción** | Permite definir y versionar el conjunto de `Asignatura`s que conforman el plan de estudios de una `Carrera` mediante registros `PlanEstudio`. Las asignaturas se seleccionan del catálogo existente. |
| **Entidades involucradas** | `PlanEstudio`, `Carrera`, `Asignatura` |
| **Precondiciones** | Existe al menos una `Carrera` registrada. Existe al menos una `Asignatura` activa en el catálogo. El administrador ha iniciado sesión. |
| **Postcondiciones** | Se crean o actualizan registros `PlanEstudio` con `carrera_id`, `asignatura_id`, `nombre` y `anio`. Se conserva el historial de versiones por `anio`. |
| **Flujo principal** | 1. El administrador selecciona una `Carrera` (por `carrera_id`). 2. Accede al `PlanEstudio` activo (mayor `anio` publicado). 3. Para agregar una asignatura: busca en el catálogo por `nombre` o `codigo` y la vincula al plan indicando el semestre sugerido. 4. Para remover una asignatura: la desvincula del plan siempre que no tenga `Inscripcion`es activas. 5. Repite los pasos 3 y 4 hasta completar la estructura del plan. 6. Publica la nueva versión asignando el `anio` correspondiente. |
| **Flujos alternativos** | 6a. Si guarda como borrador, el `PlanEstudio` anterior (menor `anio`) sigue vigente hasta que se publique la nueva versión. |
| **Excepciones** | E1: Intento de remover una `Asignatura` que tiene `Inscripcion`es activas en algún `Grupo` → operación bloqueada. E2: Plan sin ninguna `Asignatura` vinculada → no se permite publicar. |

---

## CU-04 — Gestionar asignaturas

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-04 – Gestionar asignaturas |
| **Actor(es)** | Administrador |
| **Descripción** | Permite crear, editar y archivar `Asignatura`s en el catálogo del sistema, manteniéndolas disponibles para ser vinculadas a planes de estudio y grupos. |
| **Entidades involucradas** | `Asignatura` |
| **Precondiciones** | El administrador ha iniciado sesión. |
| **Postcondiciones** | La `Asignatura` queda creada, actualizada o archivada en el catálogo. Se actualiza `updated_at` en cada operación. |
| **Flujo principal** | 1. El administrador accede al catálogo de asignaturas. 2. Selecciona la acción: **Crear / Editar / Archivar**. 3. Para **crear**: ingresa `nombre`, `codigo` (único), `descripcion` y `creditos`; el sistema asigna `id` y `created_at`. 4. Para **editar**: modifica `nombre`, `descripcion` o `creditos` siempre que la asignatura no tenga `Grupo`s activos en el semestre vigente. 5. Para **archivar**: el sistema verifica que la asignatura no esté vinculada a ningún `Grupo` activo ni a un `PlanEstudio` vigente, luego la marca como inactiva. 6. El sistema confirma la operación y actualiza `updated_at`. |
| **Flujos alternativos** | 1a. El administrador puede filtrar el catálogo por estado (activa/archivada) o por `creditos` antes de seleccionar una asignatura. |
| **Excepciones** | E1: `Asignatura.codigo` duplicado al crear → operación rechazada, el sistema indica que ya existe y ofrece buscarla en el catálogo. E2: `creditos` con valor menor o igual a cero → el sistema rechaza e indica que el valor debe ser positivo. E3: Intento de archivar una asignatura con `Grupo`s activos o en un `PlanEstudio` vigente → operación bloqueada. |

---

## CU-05 — Asignar docente a grupo

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-05 – Asignar docente a grupo |
| **Actor(es)** | Administrador |
| **Descripción** | Permite vincular un `Docente` a un `Grupo` existente en el semestre activo. El grupo ya tiene definida su `Asignatura`, por lo que la asignación implica que el docente quedará responsable de impartir dicha asignatura en ese grupo. |
| **Entidades involucradas** | `Grupo`, `Docente`, `Semestre`, `Asignatura` |
| **Precondiciones** | Existe al menos un `Grupo` con `semestre_id` apuntando a un `Semestre` con `estado = true` y con `asignatura_id` definido. El `Docente` tiene `User.is_active = true`. |
| **Postcondiciones** | `Grupo.docente_id` queda actualizado con el `id` del docente asignado. `Grupo.updated_at` se actualiza. El docente recibe notificación indicando el grupo y la asignatura correspondiente. |
| **Flujo principal** | 1. El administrador selecciona el `Semestre` activo (`estado = true`). 2. Busca y selecciona el `Grupo` (por `nombre` o `codigo_grupo`); el sistema muestra la `Asignatura` asociada (`Asignatura.nombre`, `Asignatura.codigo`). 3. Busca y selecciona el `Docente` (por `nombre`, `apellido` o `cedula`). 4. El sistema verifica que el docente seleccionado no tenga ya otro `Grupo` con el mismo `asignatura_id` en el mismo `semestre_id`. 5. El sistema verifica que `Grupo.docente_id` sea distinto al docente seleccionado. 6. Confirma: actualiza `Grupo.docente_id` y `updated_at`. 7. El sistema notifica al docente indicando el `Grupo` y la `Asignatura` asignada. |
| **Flujos alternativos** | 5a. Reasignación: si el grupo aún no tiene `Nota`s registradas, el administrador puede cambiar `Grupo.docente_id` a otro docente, siempre que ese docente no tenga ya un grupo con la misma `asignatura_id` en el semestre activo. |
| **Excepciones** | E1: `Grupo.docente_id` ya corresponde al docente seleccionado → operación rechazada. E2: El docente ya tiene un `Grupo` con el mismo `asignatura_id` en el mismo `semestre_id` → operación rechazada para evitar duplicidad. E3: El `Grupo` no tiene `asignatura_id` definido → el sistema bloquea la asignación y solicita completar la información del grupo primero. |

---

## CU-06 — Matricular estudiante en carrera

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-06 – Matricular estudiante en carrera |
| **Actor(es)** | Administrador |
| **Descripción** | Permite registrar la vinculación formal de un `Estudiante` a una `Carrera` mediante un registro `Matricula`, estableciendo su periodo de ingreso y estado académico inicial. |
| **Entidades involucradas** | `Matricula`, `Estudiante`, `Carrera` |
| **Precondiciones** | El `Estudiante` tiene `User.is_active = true`. Existe al menos una `Carrera` activa en el sistema. |
| **Postcondiciones** | Se crea un registro `Matricula` con `estudiante_id`, `carrera_id`, `periodo_ingreso` y `estado_academico` inicial. El estudiante queda formalmente vinculado a la carrera. |
| **Flujo principal** | 1. El administrador busca al `Estudiante` (por `nombre`, `apellido` o `cedula`). 2. Selecciona la `Carrera` en la que se va a matricular. 3. Ingresa el `periodo_ingreso` y el `estado_academico` inicial. 4. El sistema verifica que el estudiante no tenga ya una `Matricula` activa en la misma `Carrera`. 5. El administrador confirma. 6. El sistema crea el registro `Matricula` y notifica al estudiante. |
| **Flujos alternativos** | 4a. El administrador puede actualizar el `estado_academico` de una `Matricula` existente (por ejemplo, de activo a retirado) sin necesidad de crear una nueva. |
| **Excepciones** | E1: El estudiante ya tiene una `Matricula` activa en la misma `Carrera` → operación rechazada. E2: `periodo_ingreso` con formato inválido → el sistema resalta el campo y solicita corrección. |

---

## CU-07 — Inscribir estudiante en grupo

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-07 – Inscribir estudiante en grupo |
| **Actor(es)** | Administrador |
| **Descripción** | Permite inscribir a un `Estudiante` en los `Grupo`s de las asignaturas del semestre activo, generando registros `Inscripcion`. El estudiante debe tener previamente una `Matricula` activa en una `Carrera`. |
| **Entidades involucradas** | `Inscripcion`, `Estudiante`, `Grupo`, `Semestre`, `Matricula`, `Asignatura` |
| **Precondiciones** | El `Estudiante` tiene `User.is_active = true` y una `Matricula` activa en una `Carrera`. Existe un `Semestre` con `estado = true`. Los `Grupo`s tienen `docente_id` y `asignatura_id` definidos. |
| **Postcondiciones** | Se crean registros `Inscripcion` con `estudiante_id`, `grupo_id`, `fecha_inscripcion` y `estado` activo. El estudiante puede acceder a las asignaturas inscritas. |
| **Flujo principal** | 1. El administrador busca al `Estudiante` (por `nombre`, `apellido` o `cedula`). 2. El sistema muestra su `Matricula` activa (`carrera_id`, `periodo_ingreso`, `estado_academico`). 3. El administrador selecciona los `Grupo`s del semestre activo cuyas asignaturas pertenezcan al plan de estudios de la carrera del estudiante. 4. El sistema valida que la suma de `Asignatura.creditos` de los grupos seleccionados no exceda el límite permitido. 5. El sistema verifica que el estudiante no tenga ya una `Inscripcion` activa en alguno de los grupos seleccionados. 6. El administrador confirma. 7. El sistema crea cada `Inscripcion` y notifica al estudiante. |
| **Flujos alternativos** | 6a. Para cancelar una `Inscripcion` antes del cierre del semestre: actualiza `Inscripcion.estado` al valor cancelado sin eliminar el registro. |
| **Excepciones** | E1: Suma de créditos excede el límite permitido → el sistema rechaza y muestra el total acumulado. E2: `Grupo` sin cupo disponible → el sistema notifica la indisponibilidad. E3: El estudiante no tiene `Matricula` activa → el sistema bloquea la inscripción y redirige al administrador a CU-05. E4: La `Asignatura` del grupo no pertenece al plan de estudios de la carrera del estudiante → el sistema advierte pero permite continuar bajo confirmación explícita del administrador. |

---

## CU-08 — Crear rúbrica de evaluación

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-08 – Crear rúbrica de evaluación |
| **Actor(es)** | Docente |
| **Descripción** | Permite al docente diseñar una `Rubrica` con `Criterio`s ponderados para una asignatura. |
| **Entidades involucradas** | `Rubrica`, `Criterio` |
| **Precondiciones** | El docente tiene al menos un `Grupo` inscrito. |
| **Postcondiciones** | Se crea un registro `Rubrica` con `titulo`, `descripcion` y `es_publica`. Cada `Criterio` asociado tiene `nombre`, `descripcion` y `rubrica_id`. |
| **Flujo principal** | 1. El docente accede al módulo de rúbricas. 2. Crea una nueva `Rubrica` ingresando `titulo` y `descripcion`; `es_publica = false` por defecto. 3. Agrega `Criterio`s: cada uno con `nombre`, `descripcion` y peso porcentual. 4. Verifica que la suma de pesos de todos los criterios sea exactamente 100 %. 5. Para publicar: establece `es_publica = true`; para borrador: mantiene `es_publica = false`. |
| **Flujos alternativos** | 5a. Si guarda como borrador (`es_publica = false`), puede editar y publicar en otro momento. |
| **Excepciones** | E1: Suma de pesos ≠ 100 % → `es_publica` no puede cambiar a `true`, el sistema indica la diferencia. E2: `Rubrica` sin ningún `Criterio` asociado → no se permite publicar. |
| **Incluye** | CU-09 |

---

## CU-09 — Definir criterios y escalas

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-09 – Definir criterios y escalas |
| **Actor(es)** | Docente |
| **Descripción** | Permite al docente definir los niveles de desempeño (`Escala`) de cada `Criterio` dentro de una `Rubrica`. |
| **Entidades involucradas** | `Criterio`, `Escala` |
| **Precondiciones** | Existe una `Rubrica` con `es_publica = false` y al menos un `Criterio`. |
| **Postcondiciones** | Cada `Criterio` tiene entre 2 y 5 registros `Escala` con `nombre`, `descripcion`, `valor` (único por criterio) y `criterio_id`. |
| **Flujo principal** | 1. El docente selecciona un `Criterio` (por `rubrica_id`). 2. Agrega niveles `Escala`: ingresa `nombre` (etiqueta), `descripcion` y `valor` numérico. 3. El sistema valida que `valor` sea único dentro del mismo `criterio_id`. 4. Guarda los cambios (`created_at` se asigna). 5. Repite para cada criterio de la rúbrica. |
| **Flujos alternativos** | 2a. El docente puede seleccionar una `Escala` preexistente (de otro criterio) para reutilizar sus valores, clonando el registro con el nuevo `criterio_id`. |
| **Excepciones** | E1: `Escala.valor` duplicado en el mismo `criterio_id` → nivel rechazado. E2: Criterio con menos de 2 registros `Escala` al intentar publicar la rúbrica → publicación bloqueada. |

---

## CU-10 — Asociar rúbrica a evaluación

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-10 – Asociar rúbrica a evaluación y una asignatura |
| **Actor(es)** | Docente |
| **Descripción** | Permite al docente vincular una `Rubrica` publicada a una `Evaluacion` de una asignatura, actualizando `Evaluacion.rubrica_id` y `Evaluacion.asignatura_id`. |
| **Entidades involucradas** | `Evaluacion`, `Rubrica`, `Asignatura` |
| **Precondiciones** | Existen `Evaluacion` con `asignatura_id` del docente. Existe al menos una `Rubrica` con `es_publica = true`. y una `Asignatura`|
| **Postcondiciones** | `Evaluacion.rubrica_id` y `Evaluacion.asignatura_id` queda actualizado con el `id` de la rúbrica seleccionada. `Evaluacion.updated_at` se actualiza. |
| **Flujo principal** | 1. El docente accede a la `Evaluacion` (por `nombre` o `asignatura_id`). 2. Selecciona la opción de asociar rúbrica a asignatura. 3. El sistema lista las `Rubrica`s con `es_publica = true` y `Asignatura`. 4. El docente selecciona la `Rubrica` deseada. 5. El sistema actualiza `Evaluacion.rubrica_id` y `Evaluacion.asignatura_id` y confirma. |
| **Flujos alternativos** | 4a. Si `Evaluacion.rubrica_id` ya tiene un valor pero no existen `Nota`s para esa evaluación, el docente puede cambiar la `Rubrica` asociada. |
| **Excepciones** | E1: No existen `Rubrica`s con `es_publica = true` → el sistema sugiere ir a CU-07. E2: Ya existen `Nota`s con `rubrica_id` vinculadas a la evaluación → cambio de rúbrica bloqueado. |

---

## CU-11 — Calificar estudiante con rúbrica

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-11 – Calificar estudiante con rúbrica |
| **Actor(es)** | Docente |
| **Descripción** | Permite al docente registrar el desempeño del estudiante por `Criterio`, generando registros `CalificacionDetalle` y calculando la `Nota`. |
| **Entidades involucradas** | `Nota`, `CalificacionDetalle`, `Escala`, `Criterio`, `Rubrica`, `Inscripcion`, `Evaluacion` |
| **Precondiciones** | `Evaluacion.rubrica_id` está definido. El `Grupo` tiene `Inscripcion`es activas. |
| **Postcondiciones** | Se crea/actualiza un registro `Nota` con `estudiante_id`, `inscripcion_id`, `rubrica_id` y `nota_final` calculada. Por cada `Criterio` se crea un `CalificacionDetalle` con `escala_id`, `puntaje` y `comentario`. |
| **Flujo principal** | 1. El docente accede al listado de estudiantes de la `Evaluacion` (filtrado por `inscripcion_id`). 2. Selecciona un estudiante. 3. Por cada `Criterio` de la `Rubrica` selecciona el nivel `Escala` (por `escala_id`), lo que determina `CalificacionDetalle.puntaje` = `Escala.valor × peso_criterio`. 4. Opcionalmente ingresa `CalificacionDetalle.comentario` por criterio. 5. Guarda en borrador (sin notificar) o envía. 6. Al enviar: el sistema calcula `Nota.nota_final` como suma ponderada de los `CalificacionDetalle.puntaje` y notifica al estudiante. |
| **Flujos alternativos** | 5a. Si guarda sin enviar, `Nota` persiste con `nota_final` provisional y puede editarse en cualquier momento. |
| **Excepciones** | E1: Algún `Criterio` sin `escala_id` seleccionado al intentar enviar → el sistema bloquea e indica los criterios pendientes. |
| **Incluye** | CU-12 |
| **Extiende** | CU-13 |

---

## CU-12 — Registrar nota final

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-12 – Registrar nota final |
| **Actor(es)** | Docente |
| **Descripción** | Permite al docente consolidar y registrar oficialmente la `Nota.nota_final` de cada estudiante en el semestre, calculada como suma ponderada de todas las `Evaluacion`es del grupo. |
| **Entidades involucradas** | `Nota`, `Inscripcion`, `Evaluacion`, `Grupo`, `Semestre` |
| **Precondiciones** | Todas las `Evaluacion`es del `Grupo` tienen `Nota`s enviadas para cada `Inscripcion` activa. El `Semestre` referenciado por `Grupo.semestre_id` tiene `estado = true`. |
| **Postcondiciones** | `Nota.nota_final` queda registrada de forma oficial. `Nota.updated_at` se actualiza. El campo queda inmutable salvo aprobación del administrador. Se genera reporte descargable del grupo. |
| **Flujo principal** | 1. El docente accede al módulo de notas finales de su `Grupo`. 2. El sistema muestra por cada `Inscripcion`: la suma ponderada de `Nota.nota_final` de todas las `Evaluacion`es. 3. El docente revisa el consolidado. 4. Confirma el registro oficial. 5. El sistema bloquea edición de `Nota` y genera el reporte. |
| **Flujos alternativos** | 3a. Antes de confirmar, el docente puede volver a CU-10 para corregir cualquier `CalificacionDetalle` de una evaluación específica. |
| **Excepciones** | E1: Algún `estudiante_id` tiene `Nota`s incompletas (no todas las `Evaluacion`es calificadas) → el sistema advierte pero permite continuar con `nota_final` parcial y agrega `Nota.observaciones`. E2: `Semestre.estado = false` → el sistema bloquea el registro y redirige al administrador. |

---

## CU-13 — Consultar rúbrica de evaluación

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-13 – Consultar rúbrica de evaluación |
| **Actor(es)** | Estudiante, Docente |
| **Descripción** | Permite visualizar en modo lectura la `Rubrica` asociada a una `Evaluacion`, con todos sus `Criterio`s y `Escala`s. |
| **Entidades involucradas** | `Rubrica`, `Criterio`, `Escala`, `Evaluacion`, `Inscripcion` |
| **Precondiciones** | El estudiante tiene una `Inscripcion` activa en el `Grupo` de la asignatura. `Evaluacion.rubrica_id` apunta a una `Rubrica` con `es_publica = true`. |
| **Postcondiciones** | El estudiante visualiza la `Rubrica`. No se modifica ningún dato. |
| **Flujo principal** | 1. El estudiante accede a su listado de `Evaluacion`es (filtrado por `Inscripcion` activa). 2. Selecciona una `Evaluacion`. 3. El sistema carga la `Rubrica` referenciada por `Evaluacion.rubrica_id`. 4. Muestra: `Rubrica.titulo`, `Rubrica.descripcion`, y por cada `Criterio` (`nombre`, `descripcion`, peso) sus `Escala`s (`nombre`, `descripcion`, `valor`). |
| **Excepciones** | E1: `Evaluacion.rubrica_id` es nulo → el sistema muestra mensaje informativo indicando que aún no hay rúbrica asociada. |

---

## CU-14 — Ver calificaciones detalladas

| Campo | Detalle |
|---|---|
| **Caso de uso** | CU-14 – Ver calificaciones detalladas |
| **Actor(es)** | Estudiante |
| **Descripción** | Permite al estudiante consultar su `Nota` desglosada en `CalificacionDetalle` por cada `Criterio` de la `Rubrica`. |
| **Entidades involucradas** | `Nota`, `CalificacionDetalle`, `Escala`, `Criterio`, `Rubrica`, `Evaluacion`, `Inscripcion` |
| **Precondiciones** | El docente ha enviado la calificación: existe un registro `Nota` con `nota_final` calculada y `CalificacionDetalle`s asociados para ese `estudiante_id`. |
| **Postcondiciones** | El estudiante visualiza su nota y retroalimentación. No se modifica ningún dato. |
| **Flujo principal** | 1. El estudiante accede a sus calificaciones (filtradas por `Inscripcion.estudiante_id`). 2. Selecciona una asignatura y una `Evaluacion`. 3. El sistema recupera la `Nota` por `Nota.inscripcion_id` + `Nota.rubrica_id`. 4. Por cada `CalificacionDetalle` muestra: `Escala.nombre` (nivel obtenido), `CalificacionDetalle.puntaje`, `CalificacionDetalle.comentario` (si existe) y el `Criterio` correspondiente. 5. Muestra `Nota.nota_final` calculada y `Nota.observaciones` si las hay. 6. El estudiante puede descargar el reporte de desempeño. |
| **Excepciones** | E1: La `Nota` del estudiante aún no ha sido enviada por el docente (solo existe borrador) → el sistema no la expone al estudiante hasta que sea oficial. |
