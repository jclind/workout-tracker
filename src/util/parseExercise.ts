const getSubstringUntilNumber = (str: string) => {
  const match = str.match(/^(.*?)(?=\d)/)
  if (match) {
    return match[1]
  }
  return str
}
const getFirstNumber = (str: string): { number: string; end: string } => {
  const regex = /(\d+(?:x\d+)?)/
  const match = str.match(regex)

  if (match) {
    return { number: match[1], end: str.replace(match[1], '') }
  }

  return { number: '', end: str }
}
const formatSets = (sets: string[]): number[] => {
  const formattedSets: number[] = []

  sets.forEach(val => {
    const nums = val.split('x')
    if (nums.length === 1) formattedSets.push(Number(val))
    else if (nums.length === 2) {
      const sets = Number(nums[0])
      const reps = Number(nums[1])
      for (let i = 0; i < sets; i++) {
        formattedSets.push(reps)
      }
    }
  })

  return formattedSets
}

export const parseExercise = (str: string) => {
  const exerciseName = getSubstringUntilNumber(str).trim()

  const titleWithoutName = str.replace(exerciseName, '').trim()
  const weight = titleWithoutName
    .substring(0, titleWithoutName.indexOf(' '))
    .replaceAll('[^\\d.]', '')
    .trim()

  const repsAndCommentStr = titleWithoutName.replace(weight, '').trim()
  console.log(repsAndCommentStr)

  // console.log(repsAndCommentStr.split(','))

  const commentArr: string[] = []
  const sets: string[] = []

  repsAndCommentStr.split(',').forEach(val => {
    const { number, end } = getFirstNumber(val)
    if (number) {
      sets.push(number)
    }
    if (end.trim()) commentArr.push(end.trim())
  })

  const comment = commentArr.join(', ')
  const formattedSets: number[] = formatSets(sets)
  console.log(formattedSets)

  // return { sets, comment }

  // console.log('name:', exerciseName)
  // console.log('weight:', weight)
}
