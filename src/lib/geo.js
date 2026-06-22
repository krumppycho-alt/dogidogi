// GPS 계산 유틸리티

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calcTotalDistance(points) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat, points[i - 1].lng,
      points[i].lat, points[i].lng
    )
  }
  return total
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)}km`
}

// lat/lng 배열 → SVG path 문자열 (정규화)
export function routeToSVGPath(points, w, h, pad = 16) {
  if (points.length < 2) return ''
  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const rangeW = maxLng - minLng || 0.0001
  const rangeH = maxLat - minLat || 0.0001
  const usableW = w - pad * 2
  const usableH = h - pad * 2
  const scale = Math.min(usableW / rangeW, usableH / rangeH)
  const offsetX = pad + (usableW - rangeW * scale) / 2
  const offsetY = pad + (usableH - rangeH * scale) / 2
  const pts = points.map(p => ({
    x: offsetX + (p.lng - minLng) * scale,
    y: offsetY + (maxLat - p.lat) * scale,
  }))
  return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} ` +
    pts.slice(1).map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

// GPS 포인트 필터링 (너무 가까운 점 제거 — 잡음 억제)
export function shouldAddPoint(points, newLat, newLng, minDistM = 3) {
  if (points.length === 0) return true
  const last = points[points.length - 1]
  return haversineDistance(last.lat, last.lng, newLat, newLng) >= minDistM
}

// 산책 발바닥 리워드 계산
export function calcWalkPaws(distanceM) {
  const km = distanceM / 1000
  return Math.min(50, 5 + Math.floor(km * 10))
}
