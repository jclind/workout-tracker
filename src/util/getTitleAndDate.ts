export const getTitleAndDate = (
  str: string
): { title: string; date: number | null } => {
  let title = ''
  let formattedDate: number | null = null

  const dateMatch = str.match(
    /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}(?!\/))/
  )
  if (dateMatch) {
    const shortDateRegex = /^\d{1,2}\/\d{1,2}$/
    const inputDate = new Date(Date.parse(dateMatch[1]))
    const currentDate = new Date()
    if (shortDateRegex.test(dateMatch[1])) {
      // If short date, compare with current date
      if (
        inputDate.getMonth() > currentDate.getMonth() ||
        (inputDate.getMonth() === currentDate.getMonth() &&
          inputDate.getDate() > currentDate.getDate())
      ) {
        // If date is after current date, assume it's from the previous year
        inputDate.setFullYear(currentDate.getFullYear() - 1)
      } else {
        // If date is on or before current date, use current year
        inputDate.setFullYear(currentDate.getFullYear())
      }
      formattedDate = inputDate.getTime()
      // const dateWithCurrYear = `${dateMatch[1]}/${new Date().getFullYear()}`
      // formattedDate = new Date(Date.parse(dateWithCurrYear)).getTime()
    } else {
      formattedDate = new Date(Date.parse(dateMatch[1])).getTime()
    }
    title = str.replace(dateMatch[0], '').trim().toLowerCase()
  } else {
    title = str.trim().toLowerCase()
  }
  return { title, date: formattedDate }
}
