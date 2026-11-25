import { describe, expect, it } from "vitest";
import { clinic, type Clinic } from "@/config/content/clinic";
import { datosVisibles, enlaceWhatsApp, formatearHora, sePuedeIndexar } from "@/config/content/visible";

function confirmarTodo(c: Clinic): Clinic {
  return {
    nombre: { ...c.nombre, confirmado: true },
    especialidad: { ...c.especialidad, confirmado: true },
    direccion: { ...c.direccion, confirmado: true },
    telefono: { valor: "2222-0000", confirmado: true },
    whatsapp: { valor: "50300000000", confirmado: true },
    horario: { ...c.horario, confirmado: true },
  };
}

describe("datosVisibles", () => {
  it("con todo sin confirmar no devuelve ningún dato", () => {
    expect(datosVisibles(clinic)).toEqual({});
  });

  it("los valores sin confirmar no aparecen en ninguna parte de la salida", () => {
    const salida = JSON.stringify(datosVisibles(clinic));
    for (const campo of Object.values(clinic)) {
      if (!campo.confirmado && typeof campo.valor === "string") {
        expect(salida).not.toContain(campo.valor);
      }
    }
  });

  it("devuelve solo los campos confirmados", () => {
    const c: Clinic = { ...clinic, nombre: { ...clinic.nombre, confirmado: true } };
    expect(datosVisibles(c)).toEqual({ nombre: clinic.nombre.valor });
  });

  it("un campo confirmado sin valor no se muestra", () => {
    const c: Clinic = { ...clinic, telefono: { valor: null, confirmado: true } };
    expect(datosVisibles(c)).toEqual({});
  });

  it("con todo confirmado devuelve todo, con el enlace de WhatsApp", () => {
    const visibles = datosVisibles(confirmarTodo(clinic));
    expect(visibles.nombre).toBe(clinic.nombre.valor);
    expect(visibles.horario).toEqual(clinic.horario.valor);
    expect(visibles.whatsapp).toEqual({ numero: "50300000000", enlace: "https://wa.me/50300000000" });
  });
});

describe("sePuedeIndexar", () => {
  it("no se indexa mientras falten campos esenciales", () => {
    expect(sePuedeIndexar(clinic)).toBe(false);
  });

  it("se indexa con los esenciales confirmados aunque teléfono y WhatsApp no lo estén", () => {
    const c = confirmarTodo(clinic);
    expect(sePuedeIndexar({ ...c, telefono: clinic.telefono, whatsapp: clinic.whatsapp })).toBe(true);
  });
});

describe("formato", () => {
  it("formatea horas en 12 h", () => {
    expect(formatearHora("08:00")).toBe("8:00 a. m.");
    expect(formatearHora("12:30")).toBe("12:30 p. m.");
    expect(formatearHora("17:30")).toBe("5:30 p. m.");
  });

  it("el enlace de WhatsApp quita signos", () => {
    expect(enlaceWhatsApp("+503 0000-0000")).toBe("https://wa.me/50300000000");
  });
});
