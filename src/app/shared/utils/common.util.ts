type Defined<T> = T extends undefined ? never : T;

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
