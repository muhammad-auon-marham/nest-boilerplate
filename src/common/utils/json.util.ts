/**
 * Safely decode a JSON string to an object/array
 * @param jsonString - The JSON string to decode
 * @returns Parsed JSON object/array, or the original string if parsing fails, or null if input is null
 */
export function decodeJson(jsonString: string | null): any {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return jsonString; // Return as-is if not valid JSON
  }
}
