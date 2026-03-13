import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(to: string, orderId: string, total: number) {
  try {
    await resend.emails.send({
      from: 'BANDHA <pedidos@bandha.com.ar>',
      to: [to],
      subject: '¡Tu compra en BANDHA fue exitosa!',
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido ${orderId} ha sido confirmado.</p>
        <p>Total pagado: $${total}</p>
        <p>Podés ver tu QR de retiro en la aplicación.</p>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
}
