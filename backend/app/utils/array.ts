/**
 * Utility function to compare two sets (unordered arrays) for equality
 */
export function areSetsEqual(arr1: number[], arr2: number[]): boolean {
  // Guard clause to avoid unnecessary comparisons
  if (arr1.length !== arr2.length) {
    return false
  }

  // Sort both arrays
  arr1.sort((a, b) => a - b)
  arr2.sort((a, b) => a - b)

  return arr1.every((value, index) => value === arr2[index])
}
