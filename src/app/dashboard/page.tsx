import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const role = session.user.rol;

  if (role === "admin") {
    redirect("/gestion-juntos/dashboard");
  } else if (role === "proveedor") {
    redirect("/provider/dashboard");
  } else if (role === "cliente") {
    redirect("/dashboard/cliente");
  } else {
    redirect("/elegir-rol");
  }
}
