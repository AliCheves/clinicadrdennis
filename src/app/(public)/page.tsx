import { clinic } from "@/config/content/clinic";
import { site } from "@/config/content/site";
import { datosVisibles } from "@/config/content/visible";
import { Contacto } from "./_components/contacto";
import { EnActualizacion } from "./_components/en-actualizacion";
import { Horario } from "./_components/horario";
import { Seccion } from "./_components/seccion";

export default function Home() {
  const v = datosVisibles(clinic);
  const hayDetalles = Boolean(v.direccion || v.horario || v.telefono || v.whatsapp);

  return (
    <div className="space-y-14">
      {(v.nombre || v.especialidad) && (
        <div className="space-y-3">
          {v.especialidad && (
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-acento">{v.especialidad}</p>
          )}
          {v.nombre && (
            <h1 className="font-titulo text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
              {v.nombre}
            </h1>
          )}
        </div>
      )}

      {!v.nombre && !hayDetalles && <EnActualizacion />}

      {v.direccion && (
        <Seccion titulo={site.secciones.direccion}>
          <address className="not-italic">{v.direccion}</address>
        </Seccion>
      )}

      {v.horario && (
        <Seccion titulo={site.secciones.horario}>
          <Horario dias={v.horario} />
        </Seccion>
      )}

      {(v.telefono || v.whatsapp) && (
        <Seccion titulo={site.secciones.contacto}>
          <Contacto telefono={v.telefono} whatsapp={v.whatsapp} />
        </Seccion>
      )}

      {v.nombre && !hayDetalles && <EnActualizacion />}
    </div>
  );
}
