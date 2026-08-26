export function pickFirst<T>(...arrays: T[]): T | undefined {
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i] !== undefined) {
      return arrays[i]
    }
  }
  return undefined
}

export function uniqueArrayOfStrings<T>(array: T[]): T[] {
  const result: T[] = []

  array.forEach((item) => {
    if (!result.includes(item)) {
      result.push(item)
    }
  })

  return result
}
