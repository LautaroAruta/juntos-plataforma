import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const orderId = formData.get('orderId') as string;
  const productId = formData.get('productId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;
  
  const supabase = await createClient();
  const userId = session.user.id;

  try {
    // 1. Verify order belongs to user and is delivered
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, estado')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado o no autorizado' }, { status: 404 });
    }

    if (order.estado !== 'entregado') {
      return NextResponse.json({ error: 'Solo podés calificar productos ya entregados' }, { status: 400 });
    }

    // 2. Handle Image Uploads
    const photoUrls: string[] = [];
    const files = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('image_'))
      .map(([_, value]) => value as File);

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, file);

      if (!uploadError) {
         const { data: { publicUrl } } = supabase.storage
            .from('review-photos')
            .getPublicUrl(filePath);
         photoUrls.push(publicUrl);
      }
    }

    // 3. Save Review
    const { error: reviewError } = await supabase
      .from('product_reviews')
      .insert({
        order_id: orderId,
        product_id: productId,
        user_id: userId,
        rating,
        comentario: comment,
        fotos: photoUrls
      });

    if (reviewError) throw reviewError;

    // 4. Reward Wallet
    const rewardAmount = photoUrls.length > 0 ? 150 : 50;
    const { error: walletError } = await supabase
      .from('users')
      .update({ wallet_balance: (session.user as any).wallet_balance + rewardAmount })
      .eq('id', userId);

    // 5. Log Community Event
    await supabase.from('community_events').insert({
      event_type: 'product_review',
      user_id: userId,
      payload: {
        product_id: productId,
        rating,
        has_photos: photoUrls.length > 0
      }
    });

    return NextResponse.json({ success: true, reward: rewardAmount });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
