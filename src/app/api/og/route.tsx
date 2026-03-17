import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const title = searchParams.get('title') || 'Oferta Grupal';
  const price = searchParams.get('price') || '0';
  const originalPrice = searchParams.get('originalPrice') || '0';
  const discount = searchParams.get('discount') || '0';
  const image = searchParams.get('image') || '';
  const participants = searchParams.get('participants') || '0';
  const minParticipants = searchParams.get('minParticipants') || '5';
  const remaining = parseInt(minParticipants) - parseInt(participants || '0');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#FFF8E7',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Left: Product Image */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '32px',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f0f0f0',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#ccc',
              }}
            >
              📦
            </div>
          )}
          {/* Discount Badge */}
          {parseInt(discount) > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '60px',
                background: 'linear-gradient(135deg, #009EE3, #00A650)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: '28px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {discount}% AHORRO
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 48px 48px 16px',
            gap: '16px',
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#009EE3',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            BANDHA
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '40px',
              fontWeight: '900',
              color: '#1e293b',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              display: 'flex',
            }}
          >
            {title.length > 60 ? title.substring(0, 57) + '...' : title}
          </div>

          {/* Prices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {parseInt(originalPrice) > parseInt(price) && (
              <div
                style={{
                  fontSize: '22px',
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                  display: 'flex',
                }}
              >
                ${parseInt(originalPrice).toLocaleString()}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(0, 166, 80, 0.08)',
                padding: '16px 24px',
                borderRadius: '24px',
                border: '2px solid rgba(0, 166, 80, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: '900',
                  color: '#1e293b',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  display: 'flex',
                }}
              >
                ${parseInt(price).toLocaleString()}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '2px solid rgba(0, 166, 80, 0.2)',
                  paddingLeft: '12px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#00A650', display: 'flex' }}>
                  OFERTA
                </div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#00A650', display: 'flex' }}>
                  GRUPAL
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#009EE3',
              color: 'white',
              padding: '18px 32px',
              borderRadius: '24px',
              fontSize: '20px',
              fontWeight: '900',
              marginTop: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            {remaining > 0
              ? `¡Falta${remaining === 1 ? '' : 'n'} solo ${remaining} para desbloquear!`
              : '¡Oferta desbloqueada! Unite ahora'}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
