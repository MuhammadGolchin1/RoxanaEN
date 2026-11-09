const HEALTH_OPTIONS = [
    "Type 2 diabetes",
    "High blood pressure",
    "High cholesterol",
    "Sleep apnea",
  ],
  PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
  bmiFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
function normalizeDigits(n) {
  return n.replace(/[۰-۹٠-٩]/g, (l) => String(PERSIAN_DIGITS.indexOf(l) % 10));
}
function parseMeasurement(n, l, e) {
  if (typeof n != "string" || n.length > 12) return null;
  const t = normalizeDigits(n.trim()).replace(/[٫,]/g, ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const i = Number(t);
  return i < l || i > e ? null : Math.round(i * 100);
}
function calculateBmi(n, l) {
  const e = parseMeasurement(n, 70, 270),
    t = parseMeasurement(l, 15, 650);
  if (e === null || t === null)
    return {
      invalidHeight: e === null,
      invalidWeight: t === null,
    };
  const i = t * 1e6,
    r = e ** 2,
    s = i / r,
    a = i >= 30 * r,
    c = !a && Math.round(s * 100) === 3e3 ? 29.99 : s;
  return {
    bmi: s,
    inRange: a,
    display: bmiFormatter.format(c),
  };
}
function validateContact(n, l, e) {
  const t = typeof n == "string" ? n.trim() : "",
    i =
      t.length > 0 &&
      t.length <= 80 &&
      /^[\p{L}\p{M} .‌’'-]+$/u.test(t) &&
      new RegExp("\\p{L}", "u").test(t);
  if (typeof e != "string" || e.length > 40)
    return {
      name: i ? t : null,
      value: null,
    };
  const r = normalizeDigits(e.trim());
  let s = null;
  if (l === "phone") {
    const a = r.replace(/[\s()-]/g, "");
    // Retain Iranian numbers and support international visitors.
    (/^(?:0|\+98|0098)9\d{9}$/.test(a) || /^\+[1-9]\d{6,14}$/.test(a)) &&
      (s = a);
  } else if (l === "instagram") {
    const a = r.replace(/^@/, "");
    /^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/.test(a) &&
      !a.includes("..") &&
      (s = "@" + a);
  }
  return {
    name: i ? t : null,
    value: s,
  };
}
export {
  HEALTH_OPTIONS,
  normalizeDigits,
  parseMeasurement,
  calculateBmi,
  validateContact,
};
