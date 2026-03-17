import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // 1. Verificar propiedad del producto
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('provider_id')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    if (product.provider_id !== session.user.id) {
       // @ts-ignore
       if (session.user.rol !== 'admin') {
          return NextResponse.json({ message: "No autorizado para editar este producto" }, { status: 403 });
       }
    }

    // 2. Procesar Datos de Actualización
    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio_individual = formData.get("precio_individual") as string;
    const precio_grupal_minimo = formData.get("precio_grupal_minimo") as string;
    const stock = formData.get("stock") as string;
    const categoria = formData.get("categoria") as string;
    const activo = formData.get("activo") === "true";
    const duracion_horas = formData.get("duracion_horas") as string;
    const existingImagesJson = formData.get("existing_images") as string;
    const existingUrls: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

    // 3. Manejar nuevas imágenes si existen
    // ... (rest of image logic)
    const newFiles = formData.getAll("images") as File[];
    const newUrls: string[] = [];

    for (const file of newFiles) {
        if (!file.name) continue;
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.provider_id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `product_images/${fileName}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabaseAdmin.storage
          .from('products')
          .upload(filePath, buffer, { contentType: file.type });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage.from('products').getPublicUrl(filePath);
          newUrls.push(publicUrlData.publicUrl);
        }
    }

    const allImages = [...existingUrls, ...newUrls];

    // 4. Actualizar en Base de Datos
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        nombre,
        descripcion,
        precio_individual: parseFloat(precio_individual),
        precio_grupal_minimo: parseFloat(precio_grupal_minimo),
        stock: parseInt(stock),
        categoria,
        activo,
        imagenes: allImages,
        imagen_principal: allImages.length > 0 ? allImages[0] : null
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ message: "Error al actualizar DB: " + updateError.message }, { status: 500 });
    }

    // 5. Actualizar duración si se proporcionó
    if (duracion_horas) {
        await supabaseAdmin
            .from('group_deals')
            .update({ duracion_horas: parseInt(duracion_horas) })
            .eq('product_id', id)
            .eq('estado', 'activo');
    }

    return NextResponse.json({ message: "Producto actualizado exitosamente" }, { status: 200 });

  } catch (error: any) {
    console.error("API PATCH Product error:", error);
    return NextResponse.json({ message: error.message || "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // 1. Verificar propiedad del producto (Importante por seguridad)
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('provider_id, imagenes')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    if (product.provider_id !== session.user.id) {
       // @ts-ignore - Verificamos si es admin si no es el dueño directo
       if (session.user.rol !== 'admin') {
          return NextResponse.json({ message: "No autorizado para eliminar este producto" }, { status: 403 });
       }
    }

    // 2. Eliminar de la base de datos (Supabase Admin se encarga de cascada si está configurada)
    // Borramos explícitamente ofertas grupales para estar seguros
    await supabaseAdmin.from('group_deals').delete().eq('product_id', id);
    
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error("Error al eliminar producto:", deleteError);
      return NextResponse.json({ message: "Error en base de datos: " + deleteError.message }, { status: 500 });
    }

    // 3. Opcional: Eliminar imágenes del Storage si existen
    if (product.imagenes && product.imagenes.length > 0) {
        // Extraer rutas relativas de las URLs públicas si fuera necesario
        // Por ahora lo dejamos para no complicar, Supabase Storage no borra automáticamente
    }

    return NextResponse.json({ message: "Producto eliminado exitosamente" }, { status: 200 });

  } catch (error: any) {
    console.error("API DELETE Product error:", error);
    return NextResponse.json({ message: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
