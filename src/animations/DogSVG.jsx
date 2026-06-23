import './dog.css'

const OL = '#2d1a0a'   // 공통 아웃라인 색

export default function DogSVG({ breed = {}, animation = null, size = 120, pose = 'side' }) {
  const {
    bodyColor   = '#E8C070',
    accentColor = '#B07840',
    bellyColor  = '#F8ECD0',
    noseColor   = '#D07890',
    earType     = 'floppy',
    tailType    = 'medium',
    bodyProfile = 'normal',
    spots       = false,
    anim        = {},
  } = breed

  const animVars = {
    '--leg-angle':   `${anim.legSwing?.angle    ?? 22}deg`,
    '--knee-bend':   `${(anim.legSwing?.angle   ?? 22) * 0.65}deg`,
    '--tail-angle':  `${anim.tailWag?.angle     ?? 22}deg`,
    '--body-y':      `${anim.bodyBounce?.y      ?? 2}px`,
    '--walk-speed':  `${anim.bodyBounce?.speed  ?? 1.0}s`,
    '--head-tilt':   `${anim.headTilt?.angle    ?? 10}deg`,
    '--think-speed': `${anim.headTilt?.speed    ?? 1.0}s`,
    '--sniff-x':     `${anim.sniffSway?.x       ?? 5}px`,
    '--sniff-speed': `${anim.sniffSway?.speed   ?? 1.0}s`,
  }

  const cls      = animation ? `dog-svg dog-${animation}` : 'dog-svg'
  const sleeping = animation === 'sleeping'
  const walking  = animation === 'walking' || animation === 'running'

  // 몸통 프로파일
  const bodyRx = bodyProfile === 'long' ? 54 : bodyProfile === 'stocky' ? 42 : 46
  const bodyRy = bodyProfile === 'long' ? 20 : bodyProfile === 'tall'   ? 24 : 21

  // 다리 좌표
  const LY  = 104   // 다리 상단 y
  const LUH = 20    // 상절 높이
  const LLH = 14    // 하절 높이

  if (pose === 'front') {
    return <FrontDog size={size} bodyColor={bodyColor} accentColor={accentColor}
      bellyColor={bellyColor} noseColor={noseColor} earType={earType}
      animation={animation} animVars={animVars} />
  }

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={cls} style={animVars} aria-hidden="true">

      {/* ── ZZZ (잠) ── */}
      {sleeping && (
        <>
          <text className="zzz-letter"        x="150" y="52" fill={accentColor} style={{fontSize:'16px',fontWeight:'bold',fontFamily:'serif'}}>z</text>
          <text className="zzz-letter zzz-d1" x="142" y="38" fill={accentColor} style={{fontSize:'13px',fontWeight:'bold',fontFamily:'serif'}}>z</text>
          <text className="zzz-letter zzz-d2" x="136" y="26" fill={accentColor} style={{fontSize:'10px',fontWeight:'bold',fontFamily:'serif'}}>z</text>
        </>
      )}

      {/* 바닥 그림자 */}
      <ellipse cx="78" cy="153" rx="44" ry="5" fill={OL} opacity="0.07"/>

      {/* ── 꼬리 ── */}
      <g className="dog-part dog-tail" style={{transformOrigin:'34px 98px'}}>
        <TailShape type={tailType} bodyColor={bodyColor} accentColor={accentColor}/>
      </g>

      {/* ── 뒷다리 뒤쪽 (bl) ── */}
      <g className="dog-part dog-leg dog-leg-bl" style={{transformOrigin:`38px ${LY}px`}}>
        <DogLeg x={32} y={LY} uh={LUH} lh={LLH} cx={38} fill={accentColor} klass="dog-leg-bl-knee"/>
      </g>

      {/* ── 몸통 ── */}
      <g className="dog-part dog-body-grp">
        <ellipse cx="78" cy="99" rx={bodyRx} ry={bodyRy} fill={bodyColor}/>
        <ellipse cx="78" cy="99" rx={bodyRx} ry={bodyRy} fill="none" stroke={OL} strokeWidth="2"/>
        <ellipse cx="78" cy="105" rx={bodyRx * 0.56} ry={bodyRy * 0.60} fill={bellyColor} opacity="0.6"/>
        {spots && <DalmatianSpots/>}
      </g>

      {/* ── 뒷다리 앞쪽 (br) ── */}
      <g className="dog-part dog-leg dog-leg-br" style={{transformOrigin:`51px ${LY}px`}}>
        <DogLeg x={45} y={LY} uh={LUH} lh={LLH} cx={51} fill={bodyColor} klass="dog-leg-br-knee"/>
      </g>

      {/* ── 앞다리 뒤쪽 (fl) ── */}
      <g className="dog-part dog-leg dog-leg-fl" style={{transformOrigin:`100px ${LY}px`}}>
        <DogLeg x={94} y={LY} uh={LUH} lh={LLH} cx={100} fill={accentColor} klass="dog-leg-fl-knee"/>
      </g>

      {/* ── 목 ── */}
      <path d="M112 90 Q116 78 122 75 Q130 72 132 80 Q130 92 122 95 Q114 96 112 90Z"
            fill={bodyColor}/>
      <path d="M112 90 Q116 78 122 75 Q130 72 132 80 Q130 92 122 95 Q114 96 112 90Z"
            fill="none" stroke={OL} strokeWidth="1.5"/>

      {/* 목줄 */}
      <path d="M110 92 Q122 100 134 91" stroke="#E07840" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M110 92 Q122 100 134 91" stroke="#F0A060" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
      <circle cx="122" cy="100" r="3.5" fill="#FFD040"/>
      <circle cx="122" cy="100" r="3.5" fill="none" stroke="#C09020" strokeWidth="1"/>

      {/* ── 머리 ── */}
      <g className="dog-part dog-head">

        {/* 왼쪽(가까운) 귀 */}
        <g className="dog-part dog-ear-l" style={{transformOrigin:'108px 60px'}}>
          <EarShape type={earType} side="left"  accentColor={accentColor} bellyColor={bellyColor}/>
        </g>

        {/* 머리 원 */}
        <circle cx="120" cy="68" r="28" fill={bodyColor}/>
        <circle cx="120" cy="68" r="28" fill="none" stroke={OL} strokeWidth="2"/>

        {/* 오른쪽(먼) 귀 */}
        <g className="dog-part dog-ear-r" style={{transformOrigin:'130px 52px'}}>
          <EarShape type={earType} side="right" accentColor={accentColor} bellyColor={bellyColor}/>
        </g>

        {/* 주둥이 */}
        <ellipse cx="140" cy="76" rx="14" ry="10" fill={bellyColor}/>
        <ellipse cx="140" cy="76" rx="14" ry="10" fill="none" stroke={OL} strokeWidth="1.5"/>

        {/* 볼터치 */}
        <ellipse cx="116" cy="78" rx="9" ry="6" fill="#E09090" opacity="0.35"/>

        {/* 눈 */}
        <circle cx="128" cy="63" r="6.5" fill="#fff"/>
        <circle cx="128" cy="63" r="6.5" fill="none" stroke={OL} strokeWidth="1"/>
        <circle cx="129" cy="64" r="4"   fill={OL}/>
        <circle cx="131" cy="62" r="1.8" fill="#fff"/>
        <circle cx="128" cy="66" r="0.8" fill="#fff" opacity="0.4"/>

        {/* 눈썹 */}
        <path d="M122 55 Q128 52 134 55" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* 코 */}
        <ellipse className="dog-nose" cx="149" cy="73" rx="6" ry="4.5" fill={noseColor}/>
        <ellipse cx="147" cy="71.5" rx="2.5" ry="1.5" fill="#fff" opacity="0.3"/>
        <ellipse cx="149" cy="73" rx="6" ry="4.5" fill="none" stroke={OL} strokeWidth="1"/>

        {/* 입 */}
        {!sleeping ? (
          <path d="M140 80 Q143 86 147 80 Q151 86 155 80"
                stroke={OL} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        ) : (
          <path d="M138 72 Q142 68 146 72" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
        )}

        {/* 혀 (걷기/뛰기) */}
        {walking && (
          <>
            <ellipse cx="148" cy="85" rx="4.5" ry="3.5" fill="#F08090"/>
            <path d="M143.5 85 Q148 91 152.5 85" fill="#F08090"/>
          </>
        )}
      </g>

      {/* ── 앞다리 앞쪽 (fr) ── */}
      <g className="dog-part dog-leg dog-leg-fr" style={{transformOrigin:`113px ${LY}px`}}>
        <DogLeg x={107} y={LY} uh={LUH} lh={LLH} cx={113} fill={bodyColor} klass="dog-leg-fr-knee"/>
      </g>

    </svg>
  )
}

/* ── 분절 다리: 상절 + 무릎 + 하절 + 발바닥 ── */
function DogLeg({ x, y, uh, lh, cx, fill, klass }) {
  const kneeY = y + uh
  const pawY  = kneeY + lh + 2
  return (
    <>
      {/* 상절 */}
      <rect x={x} y={y}     width={12} height={uh} rx="6" fill={fill}/>
      <rect x={x} y={y}     width={12} height={uh} rx="6" fill="none" stroke={OL} strokeWidth="1.5"/>
      {/* 무릎 ~ 하절 ~ 발바닥 */}
      <g className={`dog-part ${klass}`} style={{transformOrigin:`${cx}px ${kneeY}px`}}>
        <rect x={x} y={kneeY} width={12} height={lh} rx="6" fill={fill}/>
        <rect x={x} y={kneeY} width={12} height={lh} rx="6" fill="none" stroke={OL} strokeWidth="1.5"/>
        <ellipse cx={cx} cy={pawY} rx="8" ry="4" fill={OL} opacity="0.8"/>
      </g>
    </>
  )
}

/* ── 꼬리 ── */
function TailShape({ type, bodyColor, accentColor }) {
  if (type === 'curly')
    return <path d="M36 100 Q20 80 28 65 Q36 50 45 62 Q52 72 42 78"
                 stroke={accentColor} strokeWidth="9" fill="none" strokeLinecap="round"/>
  if (type === 'short')
    return (
      <>
        <ellipse cx="30" cy="96" rx="9" ry="12" fill={accentColor} transform="rotate(20 30 96)"/>
        <ellipse cx="30" cy="96" rx="9" ry="12" fill="none" stroke={OL} strokeWidth="1.5" transform="rotate(20 30 96)"/>
      </>
    )
  if (type === 'long')
    return <path d="M36 100 Q8 80 14 55 Q18 40 30 50"
                 stroke={bodyColor} strokeWidth="10" fill="none" strokeLinecap="round"/>
  if (type === 'pom')
    return (
      <>
        <path d="M36 100 Q22 85 26 72" stroke={accentColor} strokeWidth="7" fill="none" strokeLinecap="round"/>
        <circle cx="26" cy="67" r="11" fill={accentColor}/>
        <circle cx="26" cy="67" r="11" fill="none" stroke={OL} strokeWidth="1.5"/>
        <circle cx="24" cy="64" r="5"  fill={bodyColor} opacity="0.4"/>
      </>
    )
  // medium (default)
  return <path d="M36 100 Q16 82 20 65 Q22 58 30 62"
               stroke={bodyColor} strokeWidth="9" fill="none" strokeLinecap="round"/>
}

/* ── 귀 ── */
function EarShape({ type, side, accentColor, bellyColor }) {
  const left = side === 'left'
  const op   = left ? 1 : 0.75

  if (type === 'pointy') {
    const pts = left ? '108,60 100,35 116,40' : '130,52 122,28 138,35'
    return (
      <>
        <polygon points={pts} fill={accentColor} opacity={op}/>
        <polygon points={pts} fill="none" stroke={OL} strokeWidth="1.5" opacity={op}/>
        {left && <polygon points="108,56 103,39 113,42" fill={bellyColor} opacity="0.5"/>}
      </>
    )
  }
  if (type === 'round') {
    const [cx, cy, rx, ry] = left ? [108, 52, 12, 15] : [130, 45, 11, 14]
    return (
      <>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={accentColor} opacity={op}/>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={OL} strokeWidth="1.5" opacity={op}/>
        {left && <ellipse cx={cx} cy={cy} rx={rx*0.58} ry={ry*0.65} fill={bellyColor} opacity="0.5"/>}
      </>
    )
  }
  if (type === 'curly') {
    const [cx, cy, rx, ry] = left ? [108, 62, 14, 19] : [130, 55, 13, 18]
    return (
      <>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={accentColor} opacity={op}/>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={OL} strokeWidth="1.5" opacity={op}/>
        {left && <ellipse cx={cx} cy={cy} rx={rx*0.6} ry={ry*0.65} fill={bellyColor} opacity="0.5"/>}
      </>
    )
  }
  // floppy (default)
  if (left) return (
    <>
      <ellipse cx="108" cy="70" rx="12" ry="19" fill={accentColor} transform="rotate(-15 108 56)"/>
      <ellipse cx="108" cy="70" rx="12" ry="19" fill="none" stroke={OL} strokeWidth="1.5" transform="rotate(-15 108 56)"/>
      <ellipse cx="108" cy="70" rx="7"  ry="13" fill={bellyColor} transform="rotate(-15 108 56)" opacity="0.5"/>
    </>
  )
  return (
    <>
      <ellipse cx="130" cy="60" rx="11" ry="17" fill={accentColor} opacity="0.75" transform="rotate(10 130 48)"/>
      <ellipse cx="130" cy="60" rx="11" ry="17" fill="none" stroke={OL} strokeWidth="1.5" opacity="0.75" transform="rotate(10 130 48)"/>
    </>
  )
}

/* ── 달마시안 반점 ── */
function DalmatianSpots() {
  return (
    <g opacity="0.85">
      <circle cx="70"  cy="95"  r="6" fill="#1a1a1a"/>
      <circle cx="90"  cy="88"  r="4" fill="#1a1a1a"/>
      <circle cx="100" cy="105" r="5" fill="#1a1a1a"/>
      <ellipse cx="75" cy="108" rx="4" ry="3" fill="#1a1a1a"/>
    </g>
  )
}

/* ── 정면 강아지 ── */
function FrontDog({ size, bodyColor, accentColor, bellyColor, noseColor, earType, animation, animVars = {} }) {
  const cls      = animation ? `dog-svg dog-${animation}` : 'dog-svg'
  const sleeping = animation === 'sleeping'

  return (
    <svg viewBox="0 0 120 140" width={size} height={size} className={cls} style={animVars} aria-hidden="true">

      {sleeping && (
        <>
          <text className="zzz-letter"        x="88" y="28" fill={accentColor} style={{fontSize:'14px',fontWeight:'bold',fontFamily:'serif'}}>z</text>
          <text className="zzz-letter zzz-d1" x="80" y="15" fill={accentColor} style={{fontSize:'11px',fontWeight:'bold',fontFamily:'serif'}}>z</text>
          <text className="zzz-letter zzz-d2" x="74" y="5"  fill={accentColor} style={{fontSize:'9px', fontWeight:'bold',fontFamily:'serif'}}>z</text>
        </>
      )}

      {/* 귀 */}
      <g className="dog-part dog-ear-l" style={{transformOrigin:'32px 48px'}}>
        <ellipse cx="28" cy="56" rx="14" ry="20" fill={accentColor} transform="rotate(-10 32 48)"/>
        <ellipse cx="28" cy="56" rx="14" ry="20" fill="none" stroke={OL} strokeWidth="1.5" transform="rotate(-10 32 48)"/>
        <ellipse cx="28" cy="56" rx="8"  ry="13" fill={bellyColor} transform="rotate(-10 32 48)" opacity="0.5"/>
      </g>
      <g className="dog-part dog-ear-r" style={{transformOrigin:'88px 48px'}}>
        <ellipse cx="92" cy="56" rx="14" ry="20" fill={accentColor} transform="rotate(10 88 48)"/>
        <ellipse cx="92" cy="56" rx="14" ry="20" fill="none" stroke={OL} strokeWidth="1.5" transform="rotate(10 88 48)"/>
        <ellipse cx="92" cy="56" rx="8"  ry="13" fill={bellyColor} transform="rotate(10 88 48)" opacity="0.5"/>
      </g>

      {/* 머리 */}
      <circle cx="60" cy="55" r="34" fill={bodyColor}/>
      <circle cx="60" cy="55" r="34" fill="none" stroke={OL} strokeWidth="2"/>

      {/* 주둥이 */}
      <ellipse cx="60" cy="68" rx="18" ry="12" fill={bellyColor}/>
      <ellipse cx="60" cy="68" rx="18" ry="12" fill="none" stroke={OL} strokeWidth="1.5"/>

      {/* 볼터치 */}
      <ellipse cx="36" cy="66" rx="9" ry="6" fill="#E09090" opacity="0.35"/>
      <ellipse cx="84" cy="66" rx="9" ry="6" fill="#E09090" opacity="0.35"/>

      {/* 코 */}
      <ellipse className="dog-nose" cx="60" cy="62" rx="8" ry="5.5" fill={noseColor}/>
      <ellipse cx="57" cy="60" rx="2.5" ry="1.5" fill="#fff" opacity="0.3"/>
      <ellipse cx="60" cy="62" rx="8" ry="5.5" fill="none" stroke={OL} strokeWidth="1"/>

      {/* 눈 */}
      {sleeping ? (
        <>
          <path d="M42 50 Q48 46 54 50" stroke={accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M66 50 Q72 46 78 50" stroke={accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="47" cy="50" r="6.5" fill="#fff"/>
          <circle cx="47" cy="50" r="6.5" fill="none" stroke={OL} strokeWidth="1"/>
          <circle cx="48" cy="51" r="4.5" fill={OL}/>
          <circle cx="50" cy="48" r="2"   fill="#fff"/>
          <circle cx="73" cy="50" r="6.5" fill="#fff"/>
          <circle cx="73" cy="50" r="6.5" fill="none" stroke={OL} strokeWidth="1"/>
          <circle cx="74" cy="51" r="4.5" fill={OL}/>
          <circle cx="76" cy="48" r="2"   fill="#fff"/>
        </>
      )}

      {/* 입 */}
      <path d="M52 75 Q56 80 60 75 Q64 80 68 75"
            stroke={OL} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* 몸통 */}
      <g className="dog-part dog-body-grp">
        <ellipse cx="60" cy="110" rx="36" ry="24" fill={bodyColor}/>
        <ellipse cx="60" cy="110" rx="36" ry="24" fill="none" stroke={OL} strokeWidth="2"/>
        <ellipse cx="60" cy="116" rx="22" ry="14" fill={bellyColor} opacity="0.6"/>
      </g>

      {/* 앞발 */}
      <g className="dog-part dog-leg dog-leg-fl" style={{transformOrigin:'42px 122px'}}>
        <rect x="34" y="122" width="16" height="18" rx="8" fill={accentColor}/>
        <rect x="34" y="122" width="16" height="18" rx="8" fill="none" stroke={OL} strokeWidth="1.5"/>
      </g>
      <g className="dog-part dog-leg dog-leg-fr" style={{transformOrigin:'70px 122px'}}>
        <rect x="62" y="122" width="16" height="18" rx="8" fill={accentColor}/>
        <rect x="62" y="122" width="16" height="18" rx="8" fill="none" stroke={OL} strokeWidth="1.5"/>
      </g>
    </svg>
  )
}
