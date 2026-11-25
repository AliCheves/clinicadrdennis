// Textos de interfaz de la landing. Genéricos: no describen al doctor ni al consultorio.
// Los datos del consultorio salen solo de clinic.ts, a través de visible.ts.

export const site = {
  nombreGenerico: "Consultorio",
  descripcionGenerica: "Información del consultorio, horario de consulta y avisos legales.",
  saltarAlContenido: "Saltar al contenido",
  enActualizacion: {
    titulo: "Información en actualización",
    texto: "Estamos preparando esta página. Pronto encontrará aquí la dirección, el horario de consulta y la forma de contactarnos.",
  },
  secciones: {
    direccion: "Dirección",
    horario: "Horario de consulta",
    contacto: "Contacto",
  },
  sinConsulta: "Sin consulta",
  telefono: "Teléfono",
  botonWhatsApp: "Escribir por WhatsApp",
  botonWhatsAppAyuda: "Se abre WhatsApp en una ventana nueva",
  pie: {
    navegacion: "Enlaces legales",
    privacidad: "Aviso de privacidad",
    terminos: "Términos de uso",
    inicio: "Inicio",
  },
  borradorFecha: "Versión del borrador:",
} as const;

export const rutas = {
  inicio: "/",
  privacidad: "/privacidad",
  terminos: "/terminos",
} as const;
