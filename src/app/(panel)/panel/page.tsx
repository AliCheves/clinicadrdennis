import { redirect } from "next/navigation";
import { homeFor, requireStaff } from "@/lib/auth";

export default async function PanelInicio() {
  const staff = await requireStaff();
  redirect(homeFor(staff.role));
}
