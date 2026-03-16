import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Using Admin key internally to handle auth disparities between NextAuth and Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { user } = session;

    // Check if the user is registered as a provider
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id')
      .eq('id', user.id)
      .single();

    let providerId = provider?.id;

    // If not a provider, check if they are an admin. If so, create a provider profile for them.
    // @ts-ignore
    if (!providerId && session.user.rol === 'admin') {
      const { data: newProvider, error: createError } = await supabaseAdmin
        .from('providers')
        .insert({
          id: user.id,
          nombre_empresa: 'Administración BANDHA',
          nombre_contacto: user.name || 'Admin',
          email: user.email,
          categoria: 'Oficial',
          verificado: true
        })
        .select('id')
        .single();
        
      if (!createError && newProvider) {
        providerId = newProvider.id;
      } else {
        console.error("No se pudo crear perfil de proveedor para el admin:", createError);
      }
    }

    if (!providerId) {
       return NextResponse.json({ message: "No autorizado. Su cuenta no es de proveedor." }, { status: 403 });
    }

    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const precio_individual = formData.get("precio_individual") as string;
    const precio_grupal_minimo = formData.get("precio_grupal_minimo") as string;
    const stock = formData.get("stock") as string;
    const categoria = formData.get("categoria") as string;
    const min_participantes = formData.get("min_participantes") as string;
    const max_participantes = formData.get("max_participantes") as string;

    if (!nombre || !precio_individual || !precio_grupal_minimo || !stock || !min_participantes || !max_participantes) {
      return NextResponse.json({ message: "Faltan datos obligatorios (nombre, precios, stock, participantes)" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const files = formData.getAll("images") as File[];

    // Upload images individually using Admin client (bypassing Client RLS Insert rules)
    for (const file of files) {
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
          // Only throw if essential, or continue silently depending on strategy
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
    }

    // Insert Product using Admin client
    const { data: product, error: dbError } = await supabaseAdmin
      .from('products')
      .insert([{
        nombre,
        descripcion,
        precio_individual: parseFloat(precio_individual),
        precio_grupal_minimo: parseFloat(precio_grupal_minimo),
        stock: parseInt(stock),
        categoria,
        provider_id: providerId,
        imagenes: uploadedUrls,
        imagen_principal: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
        activo: true
      }])
      .select('id')
      .single();

    if (dbError || !product?.id) {
      console.error("Database insert error:", dbError);
      return NextResponse.json({ message: "Error en base de datos al guardar: " + (dbError?.message || "ID no retornado") }, { status: 500 });
    }

    // Create Group Deal for the new product
    console.log("Creando oferta grupal para producto:", product.id);
    const { error: dealError } = await supabaseAdmin
      .from('group_deals')
      .insert({
        product_id: product.id,
        precio_actual: parseFloat(precio_grupal_minimo),
        min_participantes: parseInt(min_participantes),
        max_participantes: parseInt(max_participantes),
        participantes_actuales: 0,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        estado: 'activo'
      });

    if (dealError) {
      console.error("Group deal creation error:", dealError);
      // If deal fails, we might want to delete the product, but for now we report the error
      return NextResponse.json({ 
        message: "Producto creado pero falló la oferta grupal: " + dealError.message 
      }, { status: 500 });
    }

    // Invalidar cache de la home para mostrar la oferta nueva
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/productos');
    } catch (e) {
      console.error("Cache revalidation error:", e);
    }

    return NextResponse.json({ message: "Producto y oferta creados exitosamente", id: product.id }, { status: 201 });

  } catch (error: any) {
    console.error("API POST Products error:", error);
    return NextResponse.json({ message: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
