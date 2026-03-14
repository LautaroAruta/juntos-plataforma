import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(to: string, orderId: string, total: number) {
  try {
    await resend.emails.send({
      from: 'BANDHA <pedidos@bandha.com.ar>',
      to: [to],
      subject: '¡Tu compra en BANDHA fue exitosa!',
      html: `
        <h1 style="color: #00AEEF; font-family: sans-serif;">¡Gracias por tu compra!</h1>
        <p>Tu pedido <strong>${orderId}</strong> ha sido confirmado.</p>
        <p>Total pagado: <strong>$${total}</strong></p>
        <p>Podés ver tu QR de retiro en la aplicación entrando al Dashboard.</p>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function sendDealUpdateEmail(to: string, dealName: string, status: 'finalizado' | 'cancelado') {
  const isSuccess = status === 'finalizado';
  try {
    await resend.emails.send({
      from: 'JUNTOS <comunidad@juntos.com.ar>',
      to: [to],
      subject: isSuccess ? `¡Buenas noticias! Se completó el grupo de ${dealName}` : `La oferta de ${dealName} ha sido cancelada`,
      html: `
        <h1 style="color: ${isSuccess ? '#10B981' : '#EF4444'}; font-family: sans-serif;">Actualización de tu Oferta</h1>
        <p>Tu oferta grupal para <strong>${dealName}</strong> ha sido <strong>${status}</strong>.</p>
        ${isSuccess 
          ? '<p>¡Ya podés ir a retirar tu producto al punto seleccionado con tu código QR!</p>' 
          : '<p>Lamentablemente no llegamos al mínimo de vecinos. El dinero ha sido devuelto a tu medio de pago original automáticamente.</p>'
        }
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}

export async function sendRewardEmail(to: string, amount: number) {
  try {
    await resend.emails.send({
      from: 'JUNTOS <premios@juntos.com.ar>',
      to: [to],
      subject: '¡Ganaste una recompensa en JUNTOS!',
      html: `
        <h1 style="color: #F59E0B; font-family: sans-serif;">🎉 ¡Nuevos créditos disponibles!</h1>
        <p>Tu amigo ya realizó su primera compra y ganaste <strong>$${amount}</strong>.</p>
        <p>Podés usarlos en tu próxima compra grupal para ahorrar aún más.</p>
      `,
    });
  } catch (error) {
    console.error("Reward email error:", error);
  }
}
