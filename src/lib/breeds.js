// 견종 정의 — 실제 생체역학 연구 기반 애니메이션 파라미터

export const BREEDS = {
  mixed: {
    id: 'mixed',
    name: '믹스견',
    emoji: '🐕',
    bodyColor: '#8B5E3C',
    accentColor: '#5c3d1e',
    bellyColor: '#C4936B',
    noseColor: '#D07890',
    earType: 'floppy',
    tailType: 'medium',
    bodyProfile: 'normal',
    anim: {
      tailWag:     { angle: 23, speed: 0.8 },
      bodyBounce:  { y: 2,  speed: 1.0 },
      legSwing:    { angle: 23, speed: 1.0 },
      headTilt:    { angle: 10, speed: 1.0 },
      sniffSway:   { x: 5, speed: 1.0 },
    },
  },
  golden: {
    id: 'golden',
    name: '골든 리트리버',
    emoji: '🦮',
    bodyColor: '#DAA520',
    accentColor: '#B8860B',
    bellyColor: '#F0D060',
    noseColor: '#D07890',
    earType: 'floppy',
    tailType: 'long',
    bodyProfile: 'fluffy',
    // 연구: 대칭적·균형 잡힌 트롯, 중간 높이 꼬리, 부드러운 곡선 바운스
    anim: {
      tailWag:     { angle: 20, speed: 0.8 },  // 중간 높이, 완만한 흔들기
      bodyBounce:  { y: 2,  speed: 1.2 },      // 부드럽고 일정
      legSwing:    { angle: 25, speed: 1.2 },  // 균형 잡힌 보폭
      headTilt:    { angle: 12, speed: 1.0 },  // 호기심 있는 기울기
      sniffSway:   { x: 5, speed: 1.2 },
    },
  },
  shiba: {
    id: 'shiba',
    name: '시바견',
    emoji: '🐕',
    bodyColor: '#C8612A',
    accentColor: '#8B3A1A',
    bellyColor: '#F5E0C0',
    noseColor: '#1a0a00',
    earType: 'pointy',
    tailType: 'curly',
    bodyProfile: 'normal',
    // 연구: 민첩·탄력적, 짧고 빠른 보폭, 높이 말린 꼬리 (제한된 각도)
    anim: {
      tailWag:     { angle: 8,  speed: 1.2 },  // 말린 꼬리라 좁은 각도
      bodyBounce:  { y: 1,  speed: 0.9 },      // 팽팽한 톱라인 — 미세한 바운스
      legSwing:    { angle: 18, speed: 0.9 },  // 빠른 짧은 보폭
      headTilt:    { angle: 18, speed: 1.2 },  // 시바 derp — 큰 고개 기울기
      sniffSway:   { x: 3, speed: 1.0 },       // 최소 스웨이
    },
  },
  corgi: {
    id: 'corgi',
    name: '코기',
    emoji: '🐕',
    bodyColor: '#F4A460',
    accentColor: '#8B6914',
    bellyColor: '#FFF8EC',
    noseColor: '#D07890',
    earType: 'pointy',
    tailType: 'short',
    bodyProfile: 'long',
    // 연구: 짧은 다리 보상 보폭, 특유 엉덩이 와글, 측면 흔들림
    anim: {
      tailWag:     { angle: 25, speed: 0.9 },  // 큰 꼬리 흔들기
      bodyBounce:  { y: 3,  speed: 1.3 },      // 측면 흔들림 포함
      legSwing:    { angle: 22, speed: 1.3 },  // 짧은 다리 보상
      headTilt:    { angle: 10, speed: 0.9 },  // 호기심 있는 포워드
      sniffSway:   { x: 6, speed: 1.1 },       // 엉덩이 와글 특성
    },
  },
  poodle: {
    id: 'poodle',
    name: '푸들',
    emoji: '🐩',
    bodyColor: '#F5F0E8',
    accentColor: '#C8C0A0',
    bellyColor: '#FAFAF8',
    noseColor: '#D07890',
    earType: 'curly',
    tailType: 'pom',
    bodyProfile: 'tall',
    // 연구: 가볍고 탄력적 프랜싱, 높은 스텝, 높이 든 꼬리
    anim: {
      tailWag:     { angle: 18, speed: 0.7 },  // 우아한 빠른 흔들기
      bodyBounce:  { y: 4,  speed: 1.0 },      // springy action
      legSwing:    { angle: 28, speed: 1.0 },  // 높은 발 올리기 (프랜싱)
      headTilt:    { angle: 10, speed: 1.1 },  // 우아한 기울임
      sniffSway:   { x: 4, speed: 1.1 },
    },
  },
  beagle: {
    id: 'beagle',
    name: '비글',
    emoji: '🐕',
    bodyColor: '#C8A060',
    accentColor: '#5C3010',
    bellyColor: '#F0E8D0',
    noseColor: '#D07890',
    earType: 'floppy',
    tailType: 'medium',
    bodyProfile: 'stocky',
    // 연구: 냄새 추적 집중, 긴 귀가 냄새 몰아옴, 지그재그 패턴
    anim: {
      tailWag:     { angle: 22, speed: 0.85 }, // 트래킹 중 활발한 꼬리
      bodyBounce:  { y: 2,  speed: 1.1 },
      legSwing:    { angle: 20, speed: 1.1 },
      headTilt:    { angle: 8,  speed: 1.0 },  // 코 쪽으로 낮추기
      sniffSway:   { x: 8, speed: 0.8 },       // 지그재그 패턴 — 가장 큰 스웨이
    },
  },
  dalmatian: {
    id: 'dalmatian',
    name: '달마시안',
    emoji: '🐕',
    bodyColor: '#F8F8F8',
    accentColor: '#1a1a1a',
    bellyColor: '#FFFFFF',
    noseColor: '#D07890',
    earType: 'floppy',
    tailType: 'long',
    bodyProfile: 'tall',
    spots: true,
    // 연구: 꾸준·수월한 장거리 보행, 긴 스트라이드, 우아한 호형 꼬리
    anim: {
      tailWag:     { angle: 15, speed: 0.9 },  // 우아한 호형
      bodyBounce:  { y: 2,  speed: 1.1 },      // 안정적·효율적
      legSwing:    { angle: 30, speed: 1.1 },  // 긴 스트라이드
      headTilt:    { angle: 10, speed: 1.0 },  // 집중하는 자세
      sniffSway:   { x: 4, speed: 1.0 },
    },
  },
}

export const BREED_LIST = Object.values(BREEDS)

export function getBreed(id) {
  return BREEDS[id] ?? BREEDS.mixed
}
