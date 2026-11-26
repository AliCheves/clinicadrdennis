import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

// Contra Supabase local con la semilla de demo. Cuentas y datos ficticios.
const CONTRASENA = "demo-local-2026";
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const PATRON_DUI = /\b\d{8}-\d\b/;

async function entrar(page: Page, rol: "doctor" | "secretaria") {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(`${rol}@demo.local`);
  await page.getByLabel("Contraseña").fill(CONTRASENA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/panel\//);
}

async function pacienteConDui(): Promise<string> {
  const { data } = await admin.from("patients").select("id").not("dui_hash", "is", null).limit(1).single();
  return data!.id;
}

test("sin sesión, el panel manda al login", async ({ page }) => {
  await page.goto("/panel/semana");
  await expect(page).toHaveURL(/\/login$/);
});

test("credenciales incorrectas muestran un error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill("doctor@demo.local");
  await page.getByLabel("Contraseña").fill("incorrecta");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "incorrectos" })).toBeVisible();
});

test("el doctor entra a Esta semana y ve todas las secciones", async ({ page }) => {
  await entrar(page, "doctor");
  await expect(page).toHaveURL(/\/panel\/semana$/);
  await expect(page.getByRole("heading", { level: 1, name: "Esta semana" })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Secciones del panel" });
  await expect(nav.getByRole("link")).toHaveCount(6);
});

test("la secretaria entra a la agenda y no puede abrir Esta semana", async ({ page }) => {
  await entrar(page, "secretaria");
  await expect(page).toHaveURL(/\/panel\/agenda$/);
  await expect(page.getByRole("navigation", { name: "Secciones del panel" }).getByRole("link", { name: "Esta semana" })).toHaveCount(0);
  await page.goto("/panel/semana");
  await expect(page).toHaveURL(/\/panel\/agenda$/);
});

test("la secretaria ve 'Registrado' y el DUI nunca llega a su HTML", async ({ page }) => {
  await entrar(page, "secretaria");
  const respuesta = await page.goto(`/panel/pacientes/${await pacienteConDui()}`);
  await expect(page.getByText("Registrado", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver DUI" })).toHaveCount(0);
  expect(await respuesta!.text()).not.toMatch(PATRON_DUI);
  expect(await page.content()).not.toMatch(PATRON_DUI);
});

test("el doctor ve el DUI y queda registrado en la auditoría", async ({ page }) => {
  const id = await pacienteConDui();
  const { count: antes } = await admin.from("audit_log").select("id", { count: "exact", head: true }).eq("entity_id", id);
  await entrar(page, "doctor");
  await page.goto(`/panel/pacientes/${id}`);
  expect(await page.content()).not.toMatch(PATRON_DUI);
  await page.getByRole("button", { name: "Ver DUI" }).click();
  await expect(page.getByTestId("dui-revelado")).toHaveText(PATRON_DUI);
  const { data } = await admin.from("audit_log").select("action").eq("entity_id", id);
  expect(data!.length).toBe((antes ?? 0) + 1);
  expect(data!.at(-1)!.action).toBe("dui_revelado");
});

test("buscar pacientes por nombre y por teléfono", async ({ page }) => {
  await entrar(page, "secretaria");
  await page.goto("/panel/pacientes?q=Martínez");
  await expect(page.getByRole("link", { name: /Ana Martínez/ })).toBeVisible();
  await page.goto("/panel/pacientes?q=0000-0002");
  await expect(page.getByRole("link", { name: /Carlos Hernández/ })).toBeVisible();
});

test("la secretaria se asigna un caso abierto", async ({ page }) => {
  await entrar(page, "secretaria");
  await page.goto("/panel/casos?estado=abierto");
  const caso = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Asignarme" }) }).first();
  await caso.getByRole("button", { name: "Asignarme" }).click();
  await expect(page.getByText("Secretaria (cuenta de demostración)").first()).toBeVisible();
});

test("cerrar sesión vuelve al login", async ({ page }) => {
  await entrar(page, "doctor");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/panel/semana");
  await expect(page).toHaveURL(/\/login$/);
});

const PANTALLAS = {
  doctor: ["/panel/semana", "/panel/agenda", "/panel/casos", "/panel/sin-vincular", "/panel/pacientes?q=prueba", "/panel/conversaciones"],
  secretaria: ["/panel/agenda", "/panel/casos", "/panel/sin-vincular", "/panel/pacientes?q=prueba", "/panel/conversaciones"],
} as const;

for (const rol of ["doctor", "secretaria"] as const) {
  test(`${rol}: cada pantalla sin scroll a 375 px, sin errores ni violaciones de accesibilidad`, async ({ page }) => {
    const errores: string[] = [];
    page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
    page.on("pageerror", (e) => errores.push(e.message));
    await page.setViewportSize({ width: 375, height: 812 });
    await entrar(page, rol);
    const conversacion = (await admin.from("conversations").select("id").limit(1).single()).data!.id;
    for (const ruta of [...PANTALLAS[rol], `/panel/conversaciones?c=${conversacion}`]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => document.documentElement.scrollWidth), ruta).toBeLessThanOrEqual(375);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(violations.map((v) => `${ruta} ${v.id}: ${v.help}`)).toEqual([]);
    }
    expect(errores).toEqual([]);
  });
}
