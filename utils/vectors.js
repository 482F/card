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

function isCross(line1, line2) {
  const is1EndBetween2 = (() => {
    const line1Vec = {
      x: line1[1].x - line1[0].x,
      y: line1[1].y - line1[0].y,
    }
    const to2Start = outerProduct(
      {
        x: line2[0].x - line1[0].x,
        y: line2[0].y - line1[0].y,
      },
      line1Vec
    )
    const to2End = outerProduct(
      {
        x: line2[1].x - line1[0].x,
        y: line2[1].y - line1[0].y,
      },
      line1Vec
    )
    return (to2Start < 0 && 0 < to2End) || (0 < to2Start && to2End < 0)
  })()
  const is2EndBetween1 = (() => {
    const line2Vec = {
      x: line2[1].x - line2[0].x,
      y: line2[1].y - line2[0].y,
    }
    const to1Start = outerProduct(
      {
        x: line1[0].x - line2[0].x,
        y: line1[0].y - line2[0].y,
      },
      line2Vec
    )
    const to1End = outerProduct(
      {
        x: line1[1].x - line2[0].x,
        y: line1[1].y - line2[0].y,
      },
      line2Vec
    )
    return (to1Start < 0 && 0 < to1End) || (0 < to1Start && to1End < 0)
  })()
  return is1EndBetween2 && is2EndBetween1
}

export function isRectangleCollide(r1, r2) {
  const lines = {
    1: [],
    2: [],
  }
  for (let i = 0; i < 4; i++) {
    lines[1].push([r1[i], r1[(i + 1) % 4]])
    lines[2].push([r2[i], r2[(i + 1) % 4]])
  }
  const isLineCrossed = lines[1].some((line1) =>
    lines[2].some((line2) => isCross(line1, line2))
  )
  if (isLineCrossed) {
    return true
  }
  const isSomePointInRect = isInRect(r2, r1[0]) || isInRect(r1, r2[0])
  if (isSomePointInRect) {
    return true
  }
}
