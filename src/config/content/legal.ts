// Borradores de /privacidad y /terminos. Pendientes de revisión legal (decisión D8 de la auditoría de Fase 0).
// No afirmar cumplimiento de ninguna ley. Responsable y contacto quedan en PENDIENTE hasta confirmarlos.

export type SeccionLegal = {
  titulo: string;
  parrafos: string[];
  lista?: string[];
};

export type DocumentoLegal = {
  titulo: string;
  descripcion: string;
  fechaBorrador: string;
  secciones: SeccionLegal[];
};

export const PENDIENTE = "Pendiente de confirmar";

export const avisoBorrador = {
  titulo: "Borrador pendiente de revisión legal",
  texto:
    "Este texto es un borrador. Todavía no ha sido revisado por un profesional del derecho y puede cambiar. No es una declaración de cumplimiento de ninguna ley.",
};

export const privacidad: DocumentoLegal = {
  titulo: "Aviso de privacidad",
  descripcion: "Cómo se tratarán los datos personales en el servicio de citas del consultorio.",
  fechaBorrador: "20 de octubre de 2026",
  secciones: [
    {
      titulo: "Quién es responsable",
      parrafos: [`Responsable del tratamiento: ${PENDIENTE}.`, `Contacto para temas de privacidad: ${PENDIENTE}.`],
    },
    {
      titulo: "Qué datos se pedirán",
      parrafos: [
        "Cuando el servicio de citas por WhatsApp esté disponible, para registrar a una persona como paciente se le pedirá:",
      ],
      lista: [
        "Nombre completo",
        "Número de teléfono",
        "Fecha de nacimiento",
        "Número de DUI",
        "Otros datos de contacto",
        "Correo electrónico, si lo tiene",
      ],
    },
    {
      titulo: "Para qué se usarán",
      parrafos: [
        "Para agendar, confirmar, reprogramar y cancelar citas, y para enviar recordatorios de esas citas por WhatsApp y, si la persona lo proporciona, por correo electrónico.",
      ],
    },
    {
      titulo: "Qué no se pide ni se envía",
      parrafos: [
        "El servicio está diseñado para no pedir ni enviar información clínica por WhatsApp ni por correo: ni diagnósticos, ni síntomas, ni tratamientos, ni resultados de exámenes.",
      ],
    },
    {
      titulo: "Cómo se protegerán",
      parrafos: [
        "El número de DUI se guardará cifrado. El acceso a los datos de pacientes se limitará al doctor y al personal del consultorio que atiende las citas, y el DUI completo solo podrá verlo el doctor.",
        "Se pedirá el consentimiento de la persona antes de guardar sus datos.",
      ],
    },
    {
      titulo: "Dónde se guardarán",
      parrafos: [
        `Los datos se guardarán con proveedores de servicios en la nube. Ubicación de los servidores: ${PENDIENTE}.`,
      ],
    },
    {
      titulo: "Cuánto tiempo se conservarán",
      parrafos: [`Plazo de conservación: ${PENDIENTE}.`],
    },
    {
      titulo: "Acceso, corrección y eliminación",
      parrafos: [
        "La persona podrá pedir ver, corregir o eliminar sus datos escribiendo al contacto de privacidad indicado arriba.",
      ],
    },
    {
      titulo: "Este sitio web",
      parrafos: [
        "Este sitio no usa cookies de seguimiento ni herramientas de analítica de terceros, y no tiene formularios que recojan datos.",
      ],
    },
    {
      titulo: "Cambios a este aviso",
      parrafos: ["Este aviso se actualizará en esta misma página. La fecha de arriba indica la versión vigente."],
    },
  ],
};

export const terminos: DocumentoLegal = {
  titulo: "Términos de uso",
  descripcion: "Condiciones de uso del sitio y del servicio de citas del consultorio.",
  fechaBorrador: "20 de octubre de 2026",
  secciones: [
    {
      titulo: "Qué es este servicio",
      parrafos: [
        "Este sitio y el asistente de citas por WhatsApp sirven para solicitar y gestionar citas en el consultorio. No ofrecen orientación médica y no sustituyen una consulta.",
      ],
    },
    {
      titulo: "Emergencias",
      parrafos: ["No use este servicio en una emergencia. Acuda a un servicio de emergencias."],
    },
    {
      titulo: "Citas",
      parrafos: [
        "Las citas están sujetas a la disponibilidad del consultorio. Las condiciones para confirmar, reprogramar o cancelar se informarán al agendar.",
      ],
    },
    {
      titulo: "Uso correcto",
      parrafos: [
        "La información que se dé al agendar debe ser verdadera y de la persona que recibirá la atención, o de alguien a quien esa persona haya autorizado.",
      ],
    },
    {
      titulo: "Responsable del servicio",
      parrafos: [`${PENDIENTE}.`],
    },
    {
      titulo: "Datos personales",
      parrafos: ["El tratamiento de datos personales se describe en el aviso de privacidad."],
    },
    {
      titulo: "Cambios a estos términos",
      parrafos: ["Estos términos se actualizarán en esta misma página. La fecha de arriba indica la versión vigente."],
    },
  ],
};
