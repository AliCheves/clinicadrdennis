// Textos del panel del doctor y la secretaria. Sin datos de pacientes ni del consultorio.

import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

export const panel = {
  titulo: "Panel del consultorio",
  cargando: "Cargando…",
  cerrarSesion: "Cerrar sesión",
  navegacion: "Secciones del panel",
  avisoDemo: "Datos de demostración: todos los pacientes son ficticios.",
  login: {
    titulo: "Entrar al panel",
    descripcion: "Acceso solo para el personal del consultorio.",
    correo: "Correo",
    contrasena: "Contraseña",
    entrar: "Entrar",
    entrando: "Entrando…",
    errorCredenciales: "Correo o contraseña incorrectos.",
    errorSinRol: "Esta cuenta no tiene acceso al panel.",
  },
  semana: {
    titulo: "Esta semana",
    descripcion: "Pacientes citados por día.",
    sinCitas: "Sin citas",
    sinConsulta: "Sin consulta",
    total: "Citas en la semana",
  },
  agenda: {
    titulo: "Agenda",
    descripcion: "Horario de consulta y citas de la semana. Solo lectura en esta etapa.",
    libre: "Libre",
    sinConsulta: "Sin consulta",
    sinVincular: "Sin vincular",
    fueraDeHorario: "Fuera del horario",
  },
  semanaNav: {
    anterior: "Semana anterior",
    siguiente: "Semana siguiente",
    actual: "Hoy",
  },
  casos: {
    titulo: "Casos pendientes",
    descripcion: "Conversaciones que el asistente no pudo resolver.",
    vacio: "No hay casos en este estado.",
    asignado: "Asignado a",
    sinAsignar: "Sin asignar",
    asignarme: "Asignarme",
    marcar: "Marcar como",
    abierto: "Abierto",
    filtros: "Filtrar por estado",
    todos: "Todos",
    verConversacion: "Ver conversación",
  },
  sinVincular: {
    titulo: "Sin vincular",
    descripcion:
      "Citas de Google Calendar que no se pudieron asociar a un paciente. No reciben recordatorios hasta completarlas.",
    vacio: "No hay citas sin vincular.",
    tituloEvento: "Título en Calendar",
  },
  pacientes: {
    titulo: "Pacientes",
    descripcion: "Busca por nombre o teléfono.",
    buscar: "Buscar",
    placeholder: "Nombre o teléfono",
    vacio: "No hay pacientes que coincidan.",
    sinBusqueda: "Escribe al menos 2 caracteres para buscar.",
    telefono: "Teléfono",
    correo: "Correo",
    nacimiento: "Fecha de nacimiento",
    dui: "DUI",
    duiRegistrado: "Registrado",
    duiNoRegistrado: "No registrado",
    verDui: "Ver DUI",
    duiAviso: "Ver el DUI queda registrado en la auditoría.",
    proximas: "Próximas citas",
    historial: "Citas anteriores",
    sinCitas: "Sin citas",
    volver: "Volver a pacientes",
    noEncontrado: "Paciente no encontrado.",
    sinDato: "—",
  },
  conversaciones: {
    titulo: "Conversaciones",
    descripcion: "Vista previa de la bandeja de WhatsApp. Responder desde aquí llega con el asistente (Fase 1).",
    vacio: "No hay conversaciones.",
    elegir: "Elige una conversación para ver los mensajes.",
    necesitaPersona: "Necesita atención",
    bot: "Asistente",
    paciente: "Paciente",
    sinPaciente: "Número sin paciente registrado",
    soloLectura: "Solo lectura: todavía no se puede responder desde el panel.",
  },
} as const;

export const navegacion: { href: string; etiqueta: string; roles: Enums["staff_role"][] }[] = [
  { href: "/panel/semana", etiqueta: "Esta semana", roles: ["doctor"] },
  { href: "/panel/agenda", etiqueta: "Agenda", roles: ["doctor", "secretaria"] },
  { href: "/panel/casos", etiqueta: "Casos", roles: ["doctor", "secretaria"] },
  { href: "/panel/sin-vincular", etiqueta: "Sin vincular", roles: ["doctor", "secretaria"] },
  { href: "/panel/pacientes", etiqueta: "Pacientes", roles: ["doctor", "secretaria"] },
  { href: "/panel/conversaciones", etiqueta: "Conversaciones", roles: ["doctor", "secretaria"] },
];

export const rolEtiqueta: Record<Enums["staff_role"], string> = {
  doctor: "Doctor",
  secretaria: "Secretaria",
};

export const estadoCita: Record<Enums["appointment_status"], string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Atendida",
  no_asistio: "No asistió",
};

export const estadoCaso: Record<Enums["handoff_status"], string> = {
  abierto: "Abierto",
  en_curso: "En curso",
  resuelto: "Resuelto",
};

export const origenCita: Record<Enums["appointment_source"], string> = {
  bot: "Asistente",
  calendario_manual: "Calendar",
  panel: "Panel",
};
