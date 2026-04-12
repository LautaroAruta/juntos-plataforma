import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const dealId = params.id;

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Verify that the deal belongs to the provider
    const { data: deal, error: dealError } = await supabase
      .from('group_deals')
      .select('*, product:products(provider_id)')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ message: "Oferta no encontrada" }, { status: 404 });
    }

    if (deal.product.provider_id !== session.user.id && session.user.rol !== 'admin') {
      return NextResponse.json({ message: "No tenés permiso para acceder a estos datos" }, { status: 403 });
    }

    // 2. Fetch all successful orders for this deal
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        user:users (nombre, apellido, email),
        estado,
        delivery_token,
        pickup_point:pickup_points (name, address)
      `)
      .eq('group_deal_id', dealId)
      .in('estado', ['pagado', 'pendiente_retiro', 'entregado'])
      .eq('arrepentimiento_solicitado', false);

    if (ordersError) throw ordersError;

    // 3. Generate CSV
    const headers = ["ID Pedido", "Cliente", "Email", "Estado", "Punto de Retiro", "Dirección", "Token Entrega"];
    const rows = (orders as any[]).map(o => {
      const user = Array.isArray(o.user) ? o.user[0] : o.user;
      const pickup = Array.isArray(o.pickup_point) ? o.pickup_point[0] : o.pickup_point;
      
      return [
        o.id.slice(0, 8),
        `${user?.nombre || ""} ${user?.apellido || ""}`,
        user?.email || "",
        o.estado,
        pickup?.name || "N/A",
        pickup?.address || "N/A",
        o.delivery_token || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell?.toString().replace(/"/g, '""') || ""}"`).join(","))
    ].join("\n");

    // 4. Return as downloadable file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=Planilla_Entrega_Deal_${dealId.slice(0,8)}.csv`
      }
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ message: "Error al exportar", error: error.message }, { status: 500 });
  }
}
