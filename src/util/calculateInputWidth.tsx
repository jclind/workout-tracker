export const calculateInputWidth = (
  text: string,
  fontFamily: string,
  padding: number
): number => {
  const hiddenElement = document.createElement('span')
  hiddenElement.style.visibility = 'hidden'
  hiddenElement.style.position = 'absolute'
  hiddenElement.style.whiteSpace = 'pre'
  hiddenElement.style.fontFamily = fontFamily
  hiddenElement.innerText = text
  document.body.appendChild(hiddenElement)

  let width = hiddenElement.offsetWidth + padding

  if (width >= 100) {
    width = width * 1.1
  }

  document.body.removeChild(hiddenElement)

  return width
}
