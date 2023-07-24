export const removeTextBeforeSubstring = (
  str: string,
  substring: string
): string => {
  const index = str.indexOf(substring)

  if (index !== -1) {
    return str.substring(index + substring.length)
  }

  return ''
}
export const removeTextAfterSubstring = (
  str: string,
  substring: string
): string => {
  const index = str.indexOf(substring)

  if (index !== -1) {
    return str.substring(0, index + substring.length)
  }

  return ''
}
