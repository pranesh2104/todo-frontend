/**
 * Type helper that excludes `undefined` from a type.
 * 
 * For example:
 * - `Defined<string | undefined>` becomes `string`
 * - `Defined<T[]>` recursively applies as it unwraps arrays via the function logic.
 */
type Defined<T> = T extends undefined ? never : T;
/**
 * Recursively removes `undefined` values from an object or array.
 * 
 * - If input is an array, recursively cleans each element, then filters out 
 *   empty objects (objects with no keys) from the resulting array.
 * - If input is an object, recursively cleans each property and excludes keys 
 *   whose value is `undefined` after cleaning.
 * - For primitives (non-object and non-array), returns the value if it's not `undefined`.
 * 
 * This function effectively prunes `undefined` properties deeply from nested
 * objects and arrays, returning a cleaned version of the original input.
 * 
 * @param obj - The input object, array, or primitive value that may contain `undefined` values.
 * @returns A new object/array/value with all `undefined` values recursively removed.
 *          The return type excludes `undefined` via the `Defined<T>` type helper.
 */
export function removeUndefined<T>(obj: T): Defined<T> {
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeUndefined(item))
      .filter(item => !(typeof item === 'object' && item !== null && Object.keys(item).length === 0)) as Defined<T>;
  }

  if (obj && typeof obj === 'object') {
    const result: any = {}; // Safe here because we're reconstructing T
    for (const [key, value] of Object.entries(obj)) {
      const cleaned = removeUndefined(value);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result as Defined<T>;
  }

  return obj !== undefined ? obj as Defined<T> : undefined as never;
}
