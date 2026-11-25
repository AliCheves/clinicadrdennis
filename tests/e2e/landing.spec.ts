import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { clinic } from "../../src/config/content/clinic";
import { formatearHora, sePuedeIndexar } from "../../src/config/content/visible";

const RUTAS = ["/", "/privacidad", "/terminos"] as const;

// Textos que no deben aparecer en el HTML mientras su campo no esté confirmado.
function valoresSinConfirmar(): string[] {
  const valores: string[] = [];
  for (const campo of [clinic.nombre, clinic.especialidad, clinic.direccion, clinic.telefono, clinic.whatsapp]) {
    if (!campo.confirmado && campo.valor) valores.push(campo.valor);
  }
  if (!clinic.horario.confirmado) {
    for (const d of clinic.horario.valor) {
      if (!("sinConsulta" in d)) valores.push(`${formatearHora(d.desde)} – ${formatearHora(d.hasta)}`);
    }
  }
  return valores;
}

for (const ruta of RUTAS) {
  test.describe(`ruta ${ruta}`, () => {
    test("carga sin errores de consola", async ({ page }) => {
      const errores: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errores.push(m.text());
      });
      page.on("pageerror", (e) => errores.push(e.message));

      const respuesta = await page.goto(ruta);
      expect(respuesta?.status()).toBe(200);
      await page.waitForLoadState("networkidle");
      expect(errores).toEqual([]);
    });

    test("sin scroll horizontal a 375 px", async ({ page }) => {
      await page.goto(ruta);
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho).toBeLessThanOrEqual(375);
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`sin violaciones de accesibilidad WCAG A/AA (${colorScheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(ruta);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });
    }

    test("ningún dato sin confirmar llega al HTML, ni en metadatos", async ({ request }) => {
      const html = await (await request.get(ruta)).text();
      for (const valor of valoresSinConfirmar()) {
        expect(html, `"${valor}" está sin confirmar`).not.toContain(valor);
      }
    });

    test("noindex mientras falten datos esenciales", async ({ page }) => {
      await page.goto(ruta);
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robots).toBe(sePuedeIndexar(clinic) ? "index, follow" : "noindex, nofollow");
    });

    test("no carga recursos de terceros", async ({ page }) => {
      const externos: string[] = [];
      page.on("request", (r) => {
        if (!r.url().startsWith("http://localhost")) externos.push(r.url());
      });
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(externos).toEqual([]);
      expect(await page.context().cookies()).toEqual([]);
    });
  });
}

test("los enlaces del pie llevan a privacidad y términos", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Aviso de privacidad" }).click();
  await expect(page).toHaveURL("/privacidad");
  await expect(page.getByRole("heading", { level: 1, name: "Aviso de privacidad" })).toBeVisible();

  await page.getByRole("link", { name: "Términos de uso" }).click();
  await expect(page).toHaveURL("/terminos");
  await expect(page.getByRole("heading", { level: 1, name: "Términos de uso" })).toBeVisible();
});

for (const ruta of ["/privacidad", "/terminos"]) {
  test(`${ruta} muestra el aviso de borrador`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByRole("note")).toContainText("Borrador pendiente de revisión legal");
  });
}
