import './dog.css'

/**
 * 도기도기 SVG 강아지 캐릭터
 * props:
 *   breed      — breeds.js의 breed 객체
 *   animation  — 'walking' | 'thinking' | 'sleeping' | 'sniffing' | 'sitting' | null
 *   size       — px (기본 120)
 *   pose       — 'side' (기본, 옆모습) | 'front' (앞모습, 빈 상태용)
 */
export default function DogSVG({ breed = {}, animation = null, size = 120, pose = 'side' }) {
  const {
    bodyColor = '#8B5E3C',
    accentColor = '#5c3d1e',
    bellyColor = '#C4936B',
    noseColor = '#1a0a00',
    earType = 'floppy',
    tailType = 'medium',
    bodyProfile = 'normal',
    spots = false,
    anim = {},
  } = breed

  // 견종별 애니메이션 CSS 변수 주입
  const animVars = {
    '--leg-angle':   `${anim.legSwing?.angle ?? 23}deg`,
    '--tail-angle':  `${anim.tailWag?.angle ?? 23}deg`,
    '--body-y':      `${anim.bodyBounce?.y ?? 2}px`,
    '--walk-speed':  `${anim.bodyBounce?.speed ?? 1.0}s`,
    '--head-tilt':   `${anim.headTilt?.angle ?? 10}deg`,
    '--think-speed': `${anim.headTilt?.speed ?? 1.0}s`,
    '--sniff-x':     `${anim.sniffSway?.x ?? 5}px`,
    '--sniff-speed': `${anim.sniffSway?.speed ?? 1.0}s`,
  }

  const cls = animation ? `dog-svg dog-${animation}` : 'dog-svg'

  if (pose === 'front') return <FrontDog size={size} bodyColor={bodyColor} accentColor={accentColor} bellyColor={bellyColor} noseColor={noseColor} earType={earType} animation={animation} animVars={animVars} />

  // ── 옆모습 (기본) ──
  // bodyProfile 적용
  const bodyRx = bodyProfile === 'long' ? 58 : bodyProfile === 'stocky' ? 48 : 52
  const bodyRy = bodyProfile === 'long' ? 22 : bodyProfile === 'tall' ? 26 : 24
  const legH = bodyProfile === 'long' ? 18 : bodyProfile === 'tall' ? 28 : 24

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={cls} style={animVars} aria-hidden="true">
      {/* 꼬리 */}
      <g className="dog-part dog-tail" style={{ transformOrigin: '36px 100px' }}>
        <TailShape type={tailType} bodyColor={bodyColor} accentColor={accentColor} />
      </g>

      {/* 뒷다리 (뒤쪽) */}
      <g className="dog-part dog-leg dog-leg-bl" style={{ transformOrigin: '38px 108px' }}>
        <rect x="31" y="108" width="14" height={legH} rx="7" fill={accentColor} />
        <rect x="31" y={108 + legH - 6} width="14" height="8" rx="4" fill={noseColor} />
      </g>

      {/* 몸통 그룹 */}
      <g className="dog-part dog-body-grp">
        <ellipse cx="82" cy="100" rx={bodyRx} ry={bodyRy} fill={bodyColor} />
        {/* 배 부분 */}
        <ellipse cx="82" cy="104" rx={bodyRx * 0.55} ry={bodyRy * 0.5} fill={bellyColor} opacity="0.5" />
        {/* 달마시안 반점 */}
        {spots && <DalmatianSpots bodyColor={bodyColor} />}
      </g>

      {/* 앞다리 (뒤쪽) */}
      <g className="dog-part dog-leg dog-leg-fl" style={{ transformOrigin: '104px 108px' }}>
        <rect x="97" y="108" width="14" height={legH} rx="7" fill={accentColor} />
        <rect x="97" y={108 + legH - 6} width="14" height="8" rx="4" fill={noseColor} />
      </g>
      {/* 앞다리 (앞쪽) */}
      <g className="dog-part dog-leg dog-leg-fr" style={{ transformOrigin: '116px 108px' }}>
        <rect x="109" y="108" width="14" height={legH} rx="7" fill={bodyColor} />
        <rect x="109" y={108 + legH - 6} width="14" height="8" rx="4" fill={noseColor} />
      </g>
      {/* 뒷다리 (앞쪽) */}
      <g className="dog-part dog-leg dog-leg-br" style={{ transformOrigin: '52px 108px' }}>
        <rect x="45" y="108" width="14" height={legH} rx="7" fill={bodyColor} />
        <rect x="45" y={108 + legH - 6} width="14" height="8" rx="4" fill={noseColor} />
      </g>

      {/* 머리 */}
      <g className="dog-part dog-head">
        {/* 왼쪽 귀 (가까운 쪽) */}
        <g className="dog-part dog-ear-l" style={{ transformOrigin: '108px 60px' }}>
          <EarShape type={earType} side="left" accentColor={accentColor} bodyColor={bodyColor} />
        </g>
        {/* 머리 원 */}
        <circle cx="120" cy="68" r="28" fill={bodyColor} />
        {/* 오른쪽 귀 (먼 쪽) */}
        <g className="dog-part dog-ear-r" style={{ transformOrigin: '130px 52px' }}>
          <EarShape type={earType} side="right" accentColor={accentColor} bodyColor={bodyColor} />
        </g>
        {/* 주둥이 */}
        <ellipse cx="140" cy="76" rx="13" ry="9" fill={bellyColor} />
        {/* 코 */}
        <ellipse className="dog-nose" cx="146" cy="71" rx="6" ry="4" fill={noseColor} />
        {/* 콧구멍 */}
        <ellipse cx="144" cy="72" rx="1.5" ry="1" fill="#444" opacity="0.5" />
        <ellipse cx="148" cy="72" rx="1.5" ry="1" fill="#444" opacity="0.5" />
        {/* 눈 */}
        <circle cx="130" cy="62" r="4.5" fill="#fff" />
        <circle cx="131" cy="62" r="3" fill={noseColor} />
        <circle cx="132" cy="61" r="1" fill="#fff" />
        {/* 입 */}
        {animation !== 'sleeping' && (
          <path d="M 136 80 Q 140 84 144 80" stroke={noseColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}
        {/* 수면 중 눈 */}
        {animation === 'sleeping' && (
          <path d="M 127 62 Q 130 58 133 62" stroke={noseColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  )
}

// ── 꼬리 모양 ──────────────────────────────────────────────────
function TailShape({ type, bodyColor, accentColor }) {
  if (type === 'curly') {
    return <path d="M 36 100 Q 20 80 28 65 Q 36 50 45 62 Q 52 72 42 78" stroke={accentColor} strokeWidth="8" fill="none" strokeLinecap="round" />
  }
  if (type === 'short') {
    return <ellipse cx="30" cy="96" rx="9" ry="12" fill={accentColor} transform="rotate(20 30 96)" />
  }
  if (type === 'long') {
    return <path d="M 36 100 Q 8 80 14 55 Q 18 40 30 50" stroke={bodyColor} strokeWidth="9" fill="none" strokeLinecap="round" />
  }
  if (type === 'pom') {
    return (
      <>
        <path d="M 36 100 Q 22 85 26 72" stroke={accentColor} strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="26" cy="67" r="10" fill={accentColor} opacity="0.85" />
      </>
    )
  }
  // medium (default)
  return <path d="M 36 100 Q 16 82 20 65 Q 22 58 30 62" stroke={bodyColor} strokeWidth="8" fill="none" strokeLinecap="round" />
}

// ── 귀 모양 ──────────────────────────────────────────────────
function EarShape({ type, side, accentColor, bodyColor }) {
  if (type === 'pointy') {
    if (side === 'left') return <polygon points="108,60 100,35 116,40" fill={accentColor} />
    return <polygon points="130,52 122,28 138,35" fill={accentColor} opacity="0.7" />
  }
  if (type === 'round') {
    if (side === 'left') return <ellipse cx="108" cy="52" rx="11" ry="14" fill={accentColor} />
    return <ellipse cx="130" cy="45" rx="11" ry="13" fill={accentColor} opacity="0.7" />
  }
  if (type === 'curly') {
    if (side === 'left') return (
      <ellipse cx="108" cy="62" rx="13" ry="18" fill={accentColor} />
    )
    return <ellipse cx="130" cy="55" rx="13" ry="17" fill={accentColor} opacity="0.7" />
  }
  // floppy (default)
  if (side === 'left') return (
    <ellipse cx="108" cy="70" rx="11" ry="18" fill={accentColor} transform="rotate(-15 108 56)" />
  )
  return (
    <ellipse cx="130" cy="60" rx="10" ry="16" fill={accentColor} opacity="0.7" transform="rotate(10 130 48)" />
  )
}

// ── 달마시안 반점 ──────────────────────────────────────────────
function DalmatianSpots({ bodyColor }) {
  return (
    <g opacity="0.85">
      <circle cx="70" cy="95" r="6" fill="#1a1a1a" />
      <circle cx="90" cy="88" r="4" fill="#1a1a1a" />
      <circle cx="100" cy="105" r="5" fill="#1a1a1a" />
      <ellipse cx="75" cy="108" rx="4" ry="3" fill="#1a1a1a" />
    </g>
  )
}

// ── 앞모습 (빈 상태 / 수면용) ──────────────────────────────────
function FrontDog({ size, bodyColor, accentColor, bellyColor, noseColor, earType, animation, animVars = {} }) {
  const cls = animation ? `dog-svg dog-${animation}` : 'dog-svg'
  return (
    <svg viewBox="0 0 120 140" width={size} height={size} className={cls} style={animVars} aria-hidden="true">
      {/* 귀 */}
      <g className="dog-part dog-ear-l" style={{ transformOrigin: '32px 48px' }}>
        <ellipse cx="28" cy="56" rx="14" ry="20" fill={accentColor} transform="rotate(-10 32 48)" />
      </g>
      <g className="dog-part dog-ear-r" style={{ transformOrigin: '88px 48px' }}>
        <ellipse cx="92" cy="56" rx="14" ry="20" fill={accentColor} transform="rotate(10 88 48)" />
      </g>
      {/* 머리 */}
      <circle cx="60" cy="55" r="34" fill={bodyColor} />
      {/* 주둥이 */}
      <ellipse cx="60" cy="68" rx="18" ry="12" fill={bellyColor} />
      {/* 코 */}
      <ellipse className="dog-nose" cx="60" cy="62" rx="8" ry="5.5" fill={noseColor} />
      {/* 콧구멍 */}
      <ellipse cx="56" cy="63" rx="2" ry="1.2" fill="#555" opacity="0.4" />
      <ellipse cx="64" cy="63" rx="2" ry="1.2" fill="#555" opacity="0.4" />
      {/* 눈 */}
      {animation === 'sleeping' ? (
        <>
          <path d="M 42 50 Q 48 46 54 50" stroke={noseColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 66 50 Q 72 46 78 50" stroke={noseColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="47" cy="50" r="6" fill="#fff" />
          <circle cx="48" cy="50" r="4" fill={noseColor} />
          <circle cx="49" cy="49" r="1.5" fill="#fff" />
          <circle cx="73" cy="50" r="6" fill="#fff" />
          <circle cx="74" cy="50" r="4" fill={noseColor} />
          <circle cx="75" cy="49" r="1.5" fill="#fff" />
        </>
      )}
      {/* 입 */}
      <path d="M 52 75 Q 60 80 68 75" stroke={noseColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* 몸통 */}
      <g className="dog-part dog-body-grp">
        <ellipse cx="60" cy="110" rx="36" ry="24" fill={bodyColor} />
        <ellipse cx="60" cy="116" rx="22" ry="14" fill={bellyColor} opacity="0.5" />
      </g>
      {/* 앞발 */}
      <g className="dog-part dog-leg dog-leg-fl" style={{ transformOrigin: '42px 122px' }}>
        <rect x="34" y="122" width="16" height="18" rx="8" fill={accentColor} />
      </g>
      <g className="dog-part dog-leg dog-leg-fr" style={{ transformOrigin: '70px 122px' }}>
        <rect x="62" y="122" width="16" height="18" rx="8" fill={accentColor} />
      </g>
    </svg>
  )
}
