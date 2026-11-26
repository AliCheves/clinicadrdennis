// Fechas del consultorio: se guardan en UTC y se calculan y muestran en America/El_Salvador
// (UTC−6, sin horario de verano). ADR-0007.

import { tz } from "@date-fns/tz";
import { addDays, addMinutes, format, isValid, parse, startOfDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export const CLINIC_TZ = "America/El_Salvador";
const enClinica = tz(CLINIC_TZ);

// Lunes 00:00 hora local de la semana que contiene `fecha`.
export function inicioDeSemana(fecha: Date): Date {
  return startOfWeek(fecha, { weekStartsOn: 1, in: enClinica });
}

// "2026-11-23" (cualquier día) → lunes de esa semana. Sin parámetro o inválido → semana actual.
export function semanaDesdeParametro(valor: string | undefined, ahora: Date = new Date()): Date {
  if (valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const fecha = parse(valor, "yyyy-MM-dd", new Date(), { in: enClinica });
    if (isValid(fecha)) return inicioDeSemana(fecha);
  }
  return inicioDeSemana(ahora);
}

export function rangoDeSemana(lunes: Date): { desde: Date; hasta: Date } {
  return { desde: lunes, hasta: addDays(lunes, 7, { in: enClinica }) };
}

// Lunes a sábado: los días en que puede haber consulta.
export function diasHabiles(lunes: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => addDays(lunes, i, { in: enClinica }));
}

export function sumarSemanas(lunes: Date, semanas: number): Date {
  return addDays(lunes, semanas * 7, { in: enClinica });
}

export function claveDia(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd", { in: enClinica });
}

// 0 = domingo … 6 = sábado, en hora local (mismo criterio que availability_rules.weekday).
export function diaDeSemana(fecha: Date): number {
  return Number(format(fecha, "i", { in: enClinica })) % 7;
}

export function hora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return format(d, "h:mm aaaa", { in: enClinica, locale: es });
}

export function etiquetaDia(fecha: Date): string {
  const texto = format(fecha, "EEEE d 'de' MMMM", { in: enClinica, locale: es });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function etiquetaDiaCorta(fecha: Date): string {
  const texto = format(fecha, "EEE d MMM", { in: enClinica, locale: es });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function etiquetaFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return format(d, "d 'de' MMMM 'de' yyyy", { in: enClinica, locale: es });
}

export function etiquetaFechaHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return `${format(d, "EEE d MMM", { in: enClinica, locale: es })}, ${hora(d)}`;
}

export function etiquetaRango(lunes: Date): string {
  const sabado = addDays(lunes, 5, { in: enClinica });
  const desde = format(lunes, "d 'de' MMMM", { in: enClinica, locale: es });
  const hasta = format(sabado, "d 'de' MMMM 'de' yyyy", { in: enClinica, locale: es });
  return `${desde} al ${hasta}`;
}

// "13:00:00" en el día local `dia` → instante UTC.
export function instanteLocal(dia: Date, horaLocal: string): Date {
  const [h, m] = horaLocal.split(":").map(Number);
  return addMinutes(startOfDay(dia, { in: enClinica }), h * 60 + m);
}

export function esHoy(fecha: Date, ahora: Date = new Date()): boolean {
  return claveDia(fecha) === claveDia(ahora);
}
