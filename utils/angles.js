function _angleToRadian(angle) {
  return (angle * Math.PI) / 180
}

const angleToRadianMap = Array(360)
  .fill(0)
  .map((_, i) => _angleToRadian(i))

export function angleToRadian(angle) {
  return angleToRadianMap[((Math.round(angle) % 360) + 360) % 360]
}

export function rotatePoint(point, rotateRadian, centerPoint) {
  const centerX = centerPoint.x ?? centerPoint
  const centerY = centerPoint.y ?? centerPoint
  const x = point.x - centerX
  const y = point.y - centerY
  const r = Math.sqrt(x ** 2 + y ** 2)
  const theta = Math.atan2(y, x) - rotateRadian
  return {
    x: Math.cos(theta) * r + centerX,
    y: Math.sin(theta) * r + centerY,
  }
}
