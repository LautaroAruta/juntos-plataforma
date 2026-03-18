import { redirect } from "next/navigation";

// Redirigir a la ruta unificada de registro de proveedor
export default function ProviderRegisterRedirect() {
  redirect("/auth/registro/proveedor");
}
