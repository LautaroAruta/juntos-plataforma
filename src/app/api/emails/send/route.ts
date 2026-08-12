import { sendPremiumEmail } from '@/lib/services/emailService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, subject, title, body, buttonText, buttonLink } = await req.json();

    if (!to || !subject || !title || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await sendPremiumEmail({
      to,
      subject,
      title,
      body,
      buttonText,
      buttonLink,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
