// Puerta única del módulo conversation (ADR-0001): casos pendientes y bandeja de WhatsApp.
export {
  ESTADOS_CASO,
  asignarCaso,
  cambiarEstadoCaso,
  listarCasos,
  listarConversaciones,
  listarPersonal,
  mensajesDe,
  type Caso,
  type ConversacionResumen,
  type EstadoCaso,
  type Mensaje,
  type Personal,
} from "./queries";
