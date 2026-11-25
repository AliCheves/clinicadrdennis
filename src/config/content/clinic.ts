// Datos del consultorio. Fuente: docs/plans/fase-0-cimientos.md § Datos del consultorio observados.
// Nada se publica mientras `confirmado` sea false. Solo Alí cambia un campo a true, tras confirmarlo con el doctor.
// No añadir datos que no estén aquí (AGENTS.md, regla 9).

export type Campo<T> = {
  valor: T;
  confirmado: boolean;
};

export type DiaDeLaSemana =
  | "lunes"
  | "martes"
  | "miércoles"
  | "jueves"
  | "viernes"
  | "sábado"
  | "domingo";

// Horas en hora local de El Salvador, formato 24 h "HH:MM" (ADR-0007).
export type HorarioDelDia =
  | { dia: DiaDeLaSemana; desde: string; hasta: string }
  | { dia: DiaDeLaSemana; sinConsulta: true };

export type Clinic = {
  nombre: Campo<string>;
  especialidad: Campo<string>;
  direccion: Campo<string>;
  // Teléfono y WhatsApp sin valor hasta resolver ADR-0011 (decisión D3 de la auditoría de Fase 0).
  telefono: Campo<string | null>;
  // Número en formato internacional sin signos, por ejemplo "503XXXXXXXX".
  whatsapp: Campo<string | null>;
  horario: Campo<HorarioDelDia[]>;
};

export const clinic: Clinic = {
  nombre: {
    valor: "Clínica de Reumatología Dr. Dennis Flores",
    confirmado: false,
  },
  especialidad: {
    valor: "Reumatología",
    confirmado: false,
  },
  direccion: {
    valor: "Avenida La Capilla, Casa 314, Colonia San Benito, San Salvador",
    confirmado: false,
  },
  telefono: {
    valor: null,
    confirmado: false,
  },
  whatsapp: {
    valor: null,
    confirmado: false,
  },
  horario: {
    valor: [
      { dia: "lunes", desde: "13:00", hasta: "17:30" },
      { dia: "martes", sinConsulta: true },
      { dia: "miércoles", desde: "15:00", hasta: "17:30" },
      { dia: "jueves", desde: "15:00", hasta: "17:30" },
      { dia: "viernes", desde: "13:00", hasta: "17:30" },
      { dia: "sábado", desde: "08:00", hasta: "11:30" },
    ],
    confirmado: false,
  },
};
