export const parseExerciseData = (str: string) => {
  const weightGroups = str.trim().split('/')
  weightGroups.forEach(group => {
    const segments = group.trim().split(' ')
    const weight = segments.shift()

    // let sets = segments.length

    // segments.forEach(val => {

    // })
  })
}
