export function randomInt(min, max, randomFn = Math.random) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError('randomInt requires integer bounds where min <= max.');
  }
  return min + Math.floor(randomFn() * (max - min + 1));
}

export function choose(items, randomFn = Math.random) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RangeError('choose requires at least one item.');
  }
  return items[randomInt(0, items.length - 1, randomFn)];
}

export function chooseDifferent(items, previous, key, randomFn = Math.random) {
  const alternatives = items.filter(item => key(item) !== previous);
  return choose(alternatives.length > 0 ? alternatives : items, randomFn);
}
