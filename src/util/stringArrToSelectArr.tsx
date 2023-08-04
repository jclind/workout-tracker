const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
}

export const stringArrToSelectArr = (
  arr: string[]
): { label: string; value: string }[] => {
  const resultArr = arr.map(val => {
    const labelVal = toTitleCase(val)
    return { label: labelVal, value: val }
  })
  return resultArr
}
