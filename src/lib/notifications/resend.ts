import { sendPremiumEmail } from '@/lib/services/emailService';
import { formatCurrency } from '@/lib/utils';

export async function sendOrderConfirmationEmail(to: string, orderId: string, total: number) {
  try {
    await sendPremiumEmail({
      to,
      subject: '¡Tu compra en BANDHA fue exitosa! 🐧',
      title: '¡Gracias por tu compra!',
      body: `<p>Tu pedido <strong>#${orderId.slice(-6).toUpperCase()}</strong> ha sido confirmado.</p>
             <p>Monto total: <strong>${formatCurrency(total)}</strong></p>
             <p>Podés seguir el estado del grupo y ver tu QR de retiro desde la sección "Mis Pedidos".</p>`,
      buttonText: 'Ver Pedido',
      buttonLink: 'https://bandha.com.ar/pedidos'
    });
  } catch (error) {
    console.error("Order email error:", error);
  }
}

export async function sendDealUpdateEmail(to: string, dealName: string, status: 'finalizado' | 'cancelado') {
  const isSuccess = status === 'finalizado';
  try {
    await sendPremiumEmail({
      to,
      subject: isSuccess ? `¡Buenas noticias! Se completó el grupo de ${dealName}` : `La oferta de ${dealName} ha sido cancelada`,
      title: isSuccess ? '¡Meta alcanzada! 🎉' : 'Oferta cancelada 😔',
      body: `<p>Tu oferta grupal para <strong>${dealName}</strong> ha sido <strong>${status}</strong>.</p>
             ${isSuccess 
               ? '<p>¡Ya podés ir a retirar tu producto al punto seleccionado con tu código QR! No olvides llevar tu celular.</p>' 
               : '<p>Lamentablemente no llegamos al mínimo de vecinos. El dinero ha sido devuelto a tu medio de pago original automáticamente.</p>'
             }`,
      buttonText: isSuccess ? 'Ver mi QR de Retiro' : 'Explorar nuevas ofertas',
      buttonLink: isSuccess ? 'https://bandha.com.ar/pedidos' : 'https://bandha.com.ar/productos'
    });
  } catch (error) {
    console.error("Deal update email error:", error);
  }
}

export async function sendRewardEmail(to: string, amount: number) {
  try {
    await sendPremiumEmail({
      to,
      subject: '¡Ganaste una recompensa en BANDHA! 🎁',
      title: '¡Nuevos créditos para vos! 🎉',
      body: `<p>¡Buenas noticias! Tu amigo completó su primera compra y acabás de ganar <strong>${formatCurrency(amount)}</strong> de regalo.</p>
             <p>Ya podés usar este saldo como descuento en tu próxima compra grupal para ahorrar aún más.</p>`,
      buttonText: 'Ir a mi Billetera',
      buttonLink: 'https://bandha.com.ar/perfil/billetera'
    });
  } catch (error) {
    console.error("Reward email error:", error);
  }
}

export async function sendOrderReadyEmail(to: string, orderId: string, itemName: string) {
  try {
    await sendPremiumEmail({
      to,
      subject: '¡Tu pedido está listo para retirar! 🛍️',
      title: '¡Todo listo!',
      body: `<p>Tu pedido de <strong>${itemName}</strong> (#${orderId.slice(-6).toUpperCase()}) ya está disponible para retirar.</p>
             <p>Recordá llevar tu celular para mostrar el código QR al proveedor.</p>`,
      buttonText: 'Ver mi QR de Retiro',
      buttonLink: 'https://bandha.com.ar/pedidos'
    });
  } catch (error) {
    console.error("Order ready email error:", error);
  }
}

export async function sendOrderDeliveredEmail(to: string, orderId: string, itemName: string) {
  try {
    await sendPremiumEmail({
      to,
      subject: '¡Gracias por usar BANDHA! 🐧',
      title: '¡Entrega confirmada!',
      body: `<p>Confirmamos que ya retiraste tu pedido de <strong>${itemName}</strong>.</p>
             <p>Esperamos que lo disfrutes. ¡No te olvides de dejar tu reseña para ayudar a otros vecinos!</p>`,
      buttonText: 'Dejar una Reseña',
      buttonLink: 'https://bandha.com.ar/pedidos'
    });
  } catch (error) {
    console.error("Order delivered email error:", error);
  }
}
