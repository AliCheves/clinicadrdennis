"use client";

import { useActionState } from "react";
import { panel } from "@/config/content/panel";
import { iniciarSesion, type EstadoLogin } from "./actions";

const inicial: EstadoLogin = { error: null };

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, inicial);
  const t = panel.login;

  return (
    <form action={accion} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="correo" className="block font-bold">
          {t.correo}
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          required
          className="block min-h-12 w-full rounded-md border border-borde bg-superficie px-4"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="contrasena" className="block font-bold">
          {t.contrasena}
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className="block min-h-12 w-full rounded-md border border-borde bg-superficie px-4"
        />
      </div>
      {estado.error && (
        <p role="alert" className="rounded-md bg-peligro-fondo px-4 py-3 text-peligro-texto">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-acento px-6 font-bold text-acento-texto transition-colors hover:bg-acento-hover disabled:opacity-70"
      >
        {pendiente ? t.entrando : t.entrar}
      </button>
    </form>
  );
}
