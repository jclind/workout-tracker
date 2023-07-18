export const getTitleAndDate = (
  str: string
): { title: string; date: string } => {
  let title = ''
  let formattedDate = ''

  const dateMatch = str.match(
    /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}(?!\/))/
  )
  if (dateMatch) {
    const shortDateRegex = /^\d{1,2}\/\d{1,2}$/
    if (shortDateRegex.test(dateMatch[1])) {
      const dateWithCurrYear = `${dateMatch[1]}/${new Date().getFullYear()}`
      formattedDate = new Date(Date.parse(dateWithCurrYear)).toDateString()
    } else {
      formattedDate = new Date(Date.parse(dateMatch[1])).toDateString()
    }
    title = str.replace(dateMatch[0], '').trim()
  } else {
    title = str.trim()
  }
  return { title, date: formattedDate }
}
