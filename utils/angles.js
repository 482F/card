function _angleToRadian(angle) {
  return (angle * Math.PI) / 180
}

const angleToRadianMap = Array(360)
  .fill(0)
  .map((_, i) => _angleToRadian(i))

export function angleToRadian(angle) {
  return angleToRadianMap[((Math.round(angle) % 360) + 360) % 360]
}
