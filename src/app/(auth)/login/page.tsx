import type { Metadata } from "next";
import { panel } from "@/config/content/panel";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: panel.login.titulo };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-semibold tracking-tight">{panel.login.titulo}</h1>
        <p className="text-texto-suave">{panel.login.descripcion}</p>
      </div>
      <LoginForm />
    </div>
  );
}
