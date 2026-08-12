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
          flexDirection: 'column',
          backgroundColor: '#0F172A', // Slate 900 for premium feel
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Decorative Gradient */}
        <div 
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(0, 158, 227, 0.15) 0%, rgba(0, 158, 227, 0) 70%)',
            display: 'flex',
          }}
        />
        
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', zIndex: 10 }}>
          {/* Left: Content */}
          <div
            style={{
              width: '60%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px 40px 60px 60px',
              gap: '24px',
            }}
          >
            {/* Logo area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ backgroundColor: '#009EE3', width: '32px', height: '32px', borderRadius: '8px' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.05em' }}>BANDHA</div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: '900',
                color: 'white',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                display: 'flex',
              }}
            >
              {title.length > 50 ? title.substring(0, 47) + '...' : title}
            </div>

            {/* Prices & Discount Row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', color: '#64748B', textDecoration: 'line-through', marginBottom: '4px' }}>
                  ${parseInt(originalPrice).toLocaleString()}
                </div>
                <div style={{ fontSize: '72px', fontWeight: '900', color: '#00A650', lineHeight: 1, letterSpacing: '-0.05em' }}>
                  ${parseInt(price).toLocaleString()}
                </div>
              </div>
              
              <div 
                style={{ 
                  backgroundColor: '#00A650', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '12px', 
                  fontSize: '28px', 
                  fontWeight: '900',
                  marginBottom: '10px'
                }}
              >
                {discount}% OFF
              </div>
            </div>

            {/* Status Button / CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                padding: '20px 32px',
                borderRadius: '24px',
                fontSize: '24px',
                fontWeight: '700',
                marginTop: '16px',
                width: 'fit-content'
              }}
            >
              {remaining > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#009EE3' }}>⚡️</span>
                  <span>Faltan solo <b style={{ color: 'white', marginLeft: '4px' }}>{remaining} vecinos</b></span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#00A650' }}>✅</span>
                  <span style={{ color: 'white' }}>¡Oferta Desbloqueada!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Image with specialized frame */}
          <div
            style={{
              width: '40%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 60px 40px 0',
            }}
          >
            <div 
              style={{ 
                width: '100%', 
                height: '80%', 
                position: 'relative',
                display: 'flex',
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
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
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                  <span style={{ fontSize: '80px', margin: 'auto' }}>📦</span>
                </div>
              )}
              
              {/* Overlay for depth */}
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '40%', 
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)',
                  display: 'flex'
                }} 
              />
            </div>
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
