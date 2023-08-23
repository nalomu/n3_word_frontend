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

export function avg(arr: Array<any>) {
  if (arr.length === 0) {
    return 0 // 避免除以 0
  }

  const sum = arr.reduce((total, num) => total + num, 0)
  const average = sum / arr.length
  return average
}
