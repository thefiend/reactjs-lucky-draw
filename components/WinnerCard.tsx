import type { Plan } from '@/lib/plan';

interface WinnerCardProps {
  winners: string[];
  title: string;
  date: string;
  plan: Plan;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function WinnerCard({ winners, title, date, plan, cardRef }: WinnerCardProps) {
  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '600px',
        height: '400px',
        background: 'linear-gradient(135deg, #f0f8fd 0%, #e6f4fb 100%)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {plan === 'free' && (
        <div
          data-testid="watermark"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'rgba(13,73,114,0.08)',
              transform: 'rotate(-30deg)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            luckydraw.me
          </span>
        </div>
      )}

      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#139DD9',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 24px 0',
        }}
      >
        🎉 Lucky Draw Winner
      </p>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {winners.map((w, i) => (
          <p
            key={`${w}-${i}`}
            style={{
              fontSize: winners.length === 1 ? '48px' : '32px',
              fontWeight: 700,
              color: '#0D4972',
              margin: '4px 0',
            }}
          >
            {w}
          </p>
        ))}
      </div>

      <p
        style={{
          fontSize: '13px',
          color: '#4A4A4A',
          opacity: 0.6,
          margin: '0 0 8px 0',
        }}
      >
        {title} · {date}
      </p>

      <p
        style={{
          fontSize: '12px',
          color: '#139DD9',
          fontWeight: 600,
          margin: 0,
        }}
      >
        luckydraw.me
      </p>
    </div>
  );
}
