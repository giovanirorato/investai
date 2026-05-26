type DecimalLike = {
  toNumber: () => number;
};

export function decimalToNumber(value: DecimalLike | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const parsed = value.toNumber();
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
