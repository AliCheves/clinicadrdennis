"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Enlace = { href: string; etiqueta: string };

export function NavPanel({ enlaces, etiqueta }: { enlaces: Enlace[]; etiqueta: string }) {
  const ruta = usePathname();
  return (
    <nav aria-label={etiqueta}>
      <ul className="flex flex-wrap gap-2">
        {enlaces.map((e) => {
          const activa = ruta === e.href || ruta.startsWith(`${e.href}/`);
          return (
            <li key={e.href}>
              <Link
                href={e.href}
                aria-current={activa ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-bold transition-colors ${
                  activa ? "bg-acento text-acento-texto" : "text-texto-suave hover:bg-fondo hover:text-texto"
                }`}
              >
                {e.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
