import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'proveedor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const providerId = session.user.id;

  try {
    // 1. Basic Stats
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, creado_en, estado, group_deal_id, product_id')
      .eq('provider_id', providerId);

    if (ordersError) throw ordersError;

    const safeOrders = orders || [];
    const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = safeOrders.length;

    // 2. Success Rate (Group Deals)
    const { data: allDeals, error: dealsError } = await supabase
      .from('group_deals')
      .select('id, estado')
      .in('id', safeOrders.map(o => o.group_deal_id).filter(Boolean));

    if (dealsError) throw dealsError;

    const safeDeals = allDeals || [];
    const completedDeals = safeDeals.filter(d => d.estado === 'completado').length;
    const activeDeals = safeDeals.filter(d => d.estado === 'activo').length;
    const totalDeals = safeDeals.length;
    const successRate = totalDeals > 0 ? (completedDeals / (totalDeals - activeDeals || 1)) * 100 : 0;

    // 3. Revenue History (Last 6 months)
    const history = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);
      const monthRevenue = safeOrders
        .filter(o => {
          const date = new Date(o.creado_en);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      history.push({
        name: format(monthStart, 'MMM', { locale: es }).toUpperCase(),
        revenue: monthRevenue,
      });
    }

    // 4. Projections (Active Deals money)
    const activeRevenue = safeOrders
      .filter(o => {
        const deal = safeDeals.find(d => d.id === o.group_deal_id);
        return deal?.estado === 'activo';
      })
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // 5. Top Products
    const { data: productsData } = await supabase
       .from('order_items')
       .select('product_id, products(nombre)')
       .in('order_id', orders.map(o => o.id));
    
    const productStats: Record<string, { name: string, count: number }> = {};
    productsData?.forEach((item: any) => {
        const pid = item.product_id;
        if (!productStats[pid]) {
            productStats[pid] = { name: item.products?.[0]?.nombre || 'Unknown', count: 0 };
        }
        productStats[pid].count++;
    });

    const topProducts = Object.values(productStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      successRate: Math.round(successRate),
      activeRevenue,
      history,
      topProducts,
      activeDealsCount: activeDeals
    });
  } catch (err) {
    console.error('Error fetching provider stats:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
