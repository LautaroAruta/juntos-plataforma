import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Check if product belongs to provider (or if user is admin)
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    // @ts-ignore
    if (product.provider_id !== session.user.id && session.user.rol !== 'admin') {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ message: error.message || "Error al eliminar" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const formData = await req.formData();
    
    // Check ownership
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('provider_id, imagenes')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
        return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    // @ts-ignore
    if (product.provider_id !== session.user.id && session.user.rol !== 'admin') {
        return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio_individual = formData.get("precio_individual") as string;
    const precio_grupal_minimo = formData.get("precio_grupal_minimo") as string;
    const stock = formData.get("stock") as string;
    const categoria = formData.get("categoria") as string;
    const active = formData.get("activo") === "true";

    // Handle images
    const existingImages = JSON.parse(formData.get("existing_images") as string || "[]");
    const newFiles = formData.getAll("images") as File[];
    const uploadedUrls: string[] = [...existingImages];

    const providerId = product.provider_id;

    for (const file of newFiles) {
        if (!file.name) continue;
        const fileExt = file.name.split('.').pop();
        const fileName = `${providerId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `product_images/${fileName}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
    }

    const updateData: any = {
        nombre,
        descripcion,
        precio_individual: parseFloat(precio_individual),
        precio_grupal_minimo: parseFloat(precio_grupal_minimo),
        stock: parseInt(stock),
        categoria,
        activo: active,
        imagenes: uploadedUrls,
        imagen_principal: uploadedUrls.length > 0 ? uploadedUrls[0] : null
    };

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: "Producto actualizado correctamente" });

  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ message: error.message || "Error al actualizar" }, { status: 500 });
  }
}
