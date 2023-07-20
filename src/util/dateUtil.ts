export const getMonthDay = (input: number | Date): string => {
  const currentDate = new Date()
  const inputDate = typeof input === 'number' ? new Date(input) : input

  if (isNaN(inputDate.getTime())) {
    throw new Error('Invalid input date.')
  }

  const inputYear = inputDate.getFullYear()
  const currentYear = currentDate.getFullYear()
  const isMoreThan11Months =
    currentYear - inputYear > 1 ||
    (currentYear - inputYear === 1 &&
      currentDate.getMonth() > inputDate.getMonth())

  const month = inputDate.getMonth() + 1
  const day = inputDate.getDate()

  if (isMoreThan11Months) {
    return `${month}/${day}/${inputYear}`
  } else {
    return `${month}/${day}`
  }
}

export const formatDateToString = (input: Date | number): string => {
  const currentDate = new Date()
  const inputDate = typeof input === 'number' ? new Date(input) : input
  const oneDay = 24 * 60 * 60 * 1000 // Milliseconds in a day

  if (isNaN(inputDate.getTime())) {
    throw new Error('Invalid input date.')
  }

  const timeDifference = Math.round(
    (currentDate.getTime() - inputDate.getTime()) / oneDay
  )
  if (timeDifference <= 1) {
    // If the date is today or yesterday, return the corresponding string
    return timeDifference === 0 ? 'Today' : 'Yesterday'
  } else if (timeDifference <= 6) {
    // If the date is 6 days or before, return the name of the day
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const dayName = days[inputDate.getDay()]
    return dayName
  } else {
    return getMonthDay(inputDate)
  }
}
