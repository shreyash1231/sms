// Dense ranking: equal scores share same rank, next distinct score rank += 1
function denseRank(studentsSortedDesc){
  let prevScore = null
  let rank = 0
  let result = {}
  for(const s of studentsSortedDesc){
    if (s.score !== prevScore){
      rank += 1
      prevScore = s.score
    }
    result[s.id] = rank
  }
  return result
}

module.exports = { denseRank }
