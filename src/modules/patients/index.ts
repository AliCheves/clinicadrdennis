// Puerta única del módulo patients (ADR-0001). Solo este módulo lee o escribe el DUI.
export {
  buscarPacientes,
  fichaPaciente,
  formatearTelefono,
  normalizarBusqueda,
  revelarDui,
  type CitaDePaciente,
  type FichaPaciente,
  type PacienteResumen,
} from "./queries";
