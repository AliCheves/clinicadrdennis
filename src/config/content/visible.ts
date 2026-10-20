// Única puerta para leer los datos del consultorio desde la interfaz y los metadatos.
// Un campo sin confirmar no sale de aquí, así que no puede llegar al HTML.

import type { Clinic, HorarioDelDia } from "./clinic";

export type DatosVisibles = {
  nombre?: string;
  especialidad?: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: { numero: string; enlace: string };
  horario?: HorarioDelDia[];
};

// Mientras alguno de estos falte, la página no se indexa (decisión D7).
// Teléfono y WhatsApp no cuentan: quedan sin publicar hasta resolver ADR-0011.
const CAMPOS_ESENCIALES = ["nombre", "especialidad", "direccion", "horario"] as const;

export function datosVisibles(c: Clinic): DatosVisibles {
  const visibles: DatosVisibles = {};

  if (c.nombre.confirmado && c.nombre.valor) visibles.nombre = c.nombre.valor;
  if (c.especialidad.confirmado && c.especialidad.valor) visibles.especialidad = c.especialidad.valor;
  if (c.direccion.confirmado && c.direccion.valor) visibles.direccion = c.direccion.valor;
  if (c.telefono.confirmado && c.telefono.valor) visibles.telefono = c.telefono.valor;
  if (c.whatsapp.confirmado && c.whatsapp.valor) {
    visibles.whatsapp = { numero: c.whatsapp.valor, enlace: enlaceWhatsApp(c.whatsapp.valor) };
  }
  if (c.horario.confirmado && c.horario.valor.length > 0) visibles.horario = c.horario.valor;

  return visibles;
}

export function sePuedeIndexar(c: Clinic): boolean {
  return CAMPOS_ESENCIALES.every((campo) => c[campo].confirmado);
}

export function enlaceWhatsApp(numero: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}`;
}

// "13:00" → "1:00 p. m.", con la convención salvadoreña.
export function formatearHora(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function etiquetaDia(dia: string): string {
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}
