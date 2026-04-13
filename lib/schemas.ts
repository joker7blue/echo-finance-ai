import { z } from "zod";

/** Coerce string values like "30 seconds" or "0.15" to numbers */
const coerceNumber = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  }
  return val;
}, z.number());