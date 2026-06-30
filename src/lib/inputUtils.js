/**
 * Strips digits/symbols from name input, allowing only letters and
 * single spaces, and capitalizes the first letter of each word as
 * the user types.
 */
export function sanitizeNameInput(value) {
  const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
  // Collapse multiple spaces but allow a trailing space while typing.
  const collapsed = lettersOnly.replace(/ {2,}/g, " ");
  return collapsed
    .split(" ")
    .map((word) =>
      word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join(" ");
}

/**
 * Strips anything that isn't a digit (and an optional single
 * decimal point) from amount input.
 */
export function sanitizeAmountInput(value) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");
  if (firstDotIndex === -1) return cleaned;
  return (
    cleaned.slice(0, firstDotIndex + 1) +
    cleaned.slice(firstDotIndex + 1).replace(/\./g, "")
  );
}
