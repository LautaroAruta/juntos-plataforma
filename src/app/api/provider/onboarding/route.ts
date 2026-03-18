import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const {
      tipoCuenta,
      nombreEmpresa,
      razonSocial,
      nombreContacto,
      telefono,
      cuit,
      categoria,
      descripcion,
      domicilioFiscal,
      codigoPostal,
      provincia,
      localidad,
      calle,
      altura,
      codigo_postal,
      direccion,
      cbuCvu,
      titularCuenta,
      latitude,
      longitude
    } = await req.json();

    // ─── Server-side validation ────────────────────────
    if (!tipoCuenta || !nombreEmpresa || !nombreContacto || !cuit || !categoria) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Validate CUIT format (basic)
    const cuitClean = cuit.replace(/[-\s]/g, "");
    if (!/^\d{11}$/.test(cuitClean)) {
      return NextResponse.json(
        { message: "Formato de CUIT inválido" },
        { status: 400 }
      );
    }

    // Validate CBU if provided
    if (cbuCvu) {
      const cbuClean = cbuCvu.replace(/\s/g, "");
      if (cbuClean.length > 0 && !/^\d{22}$/.test(cbuClean)) {
        return NextResponse.json(
          { message: "El CBU debe tener 22 dígitos" },
          { status: 400 }
        );
      }
    }

    // ─── Upsert provider ───────────────────────────────
    // Check if provider already exists (for re-registration after rejection)
    const { data: existing } = await supabaseAdmin
      .from("providers")
      .select("id")
      .eq("id", session.user.id)
      .single();

    const providerData = {
      id: session.user.id,
      tipo_cuenta: tipoCuenta,
      nombre_empresa: nombreEmpresa,
      razon_social: razonSocial || null,
      nombre_contacto: nombreContacto,
      email: session.user.email,
      telefono: telefono || null,
      cuit_rut: cuit,
      categoria: categoria,
      descripcion: descripcion || null,
      domicilio_fiscal: domicilioFiscal || null,
      direccion: direccion || null,
      provincia: provincia || null,
      localidad: localidad || null,
      calle: calle || null,
      altura: altura || null,
      codigo_postal: codigo_postal || codigoPostal || null,
      cbu_cvu: cbuCvu ? cbuCvu.replace(/\s/g, "") : null,
      titular_cuenta: titularCuenta || null,
      latitude: latitude || null,
      longitude: longitude || null,
      verificado: false,
      estado_kyc: "pendiente" as const,
      kyc_actualizado_en: new Date().toISOString(),
    };

    let providerError;

    if (existing) {
      // Update existing provider
      const { error } = await supabaseAdmin
        .from("providers")
        .update(providerData)
        .eq("id", session.user.id);
      providerError = error;
    } else {
      // Insert new provider
      const { error } = await supabaseAdmin
        .from("providers")
        .insert(providerData);
      providerError = error;
    }

    if (providerError) {
      console.error("Provider upsert error:", providerError);
      return NextResponse.json(
        { message: "Error al guardar perfil de proveedor: " + providerError.message },
        { status: 500 }
      );
    }

    // Actualizar el rol en la tabla users
    const { error: userUpdateError } = await supabaseAdmin
      .from("users")
      .update({ rol: "proveedor" })
      .eq("id", session.user.id);

    if (userUpdateError) {
      console.error("User role update error:", userUpdateError);
      // Non-blocking: profile was saved, rol update can be retried
    }

    return NextResponse.json(
      { message: "Proveedor registrado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Provider onboarding error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
