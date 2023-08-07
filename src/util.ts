export function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

export function getRandomElementsFromArray(array: Array<any>, count: number) {
  const shuffledArray = [...array]
  shuffleArray(shuffledArray)
  return shuffledArray.slice(0, count)
}
