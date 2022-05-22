const arrayAdd = (arr1, arr2) => {
return arr1.map((v, i) => {
    return v + arr2[i]
})
}

const arrayDifference = (arr1, arr2) => {
return arr1.map((v, i) => {
    const diff = Math.abs(v - arr2[i])
    return diff
})
}
  

export default transformations = {
    add: arrayAdd,
    difference: arrayDifference
  }