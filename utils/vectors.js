function outerProduct(vec1, vec2) {
  return vec1.x * vec2.y - vec2.x * vec1.y
}

/**
 * 線から見て点が右にあれば 1, 左にあれば -1, どちらでもなければ 0
 */
function getDirectionSign(line, point) {
  const lineVec = {
    x: line[1].x - line[0].x,
    y: line[1].y - line[0].y,
  }
  const toPointVec = {
    x: point.x - line[0].x,
    y: point.y - line[0].y,
  }
  return Math.sign(outerProduct(lineVec, toPointVec))
}
function isRight(line, point) {
  return 0 < getDirectionSign(line, point)
}
function isLeft(line, point) {
  return getDirectionSign(line, point) < 0
}

function isInRect(rect, point) {
  const lines = []

  for (let i = 0; i < 4; i++) {
    lines.push([rect[(i + 1) % 4], rect[i]])
  }
  return (
    Array(4)
      .fill(0)
      .every((_, i) => isRight(lines[i], point)) ||
    Array(4)
      .fill(0)
      .every((_, i) => isLeft(lines[i], point))
  )
}

export function isRectangleCollide(r1, r2) {
  return r1.some((p1) => isInRect(r2, p1)) || r2.some((p2) => isInRect(r1, p2))
}
