import { ITaskTagInput } from "app/features/dashboard/models/task.model";

/**
 * Recursively removes '__typename' field from objects and arrays
 * @param data Any data structure that might contain '__typename' fields
 * @returns A clean copy without '__typename' fields
 */
export function removeTypename<T>(data: T): T {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => removeTypename(item)) as unknown as T;
  }

  // Handle objects
  if (typeof data === 'object') {
    const result = { ...data } as Record<string, any>;

    // Remove __typename if present
    if ('__typename' in result) {
      delete result['__typename'];
    }

    // Process nested objects/arrays
    Object.keys(result).forEach(key => {
      if (result[key] !== null && typeof result[key] === 'object') {
        result[key] = removeTypename(result[key]);
      }
    });

    return result as T;
  }

  // Return primitives unchanged
  return data;
}
/**
 * Removes duplicate tags from the input `data` array based on tag name,
 * comparing them against the original `ogTags` array.
 * 
 * @param data - The array of new tag inputs to filter.
 * @param ogTags - The array of existing tags to check for duplicates.
 * @returns A new array containing only the tags from `data` that are not present in `ogTags`.
 */
export function removeDuplicateTag(data: ITaskTagInput[], ogTags: ITaskTagInput[]): ITaskTagInput[] {
  if (!ogTags || !ogTags.length || !data || !data.length) return data;
  data = data.filter(tag => !ogTags.some(ogTag => ogTag.name === tag.name))
  return data;
}