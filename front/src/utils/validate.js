function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function currentYear(){ return new Date().getFullYear() }

function validateStudent(input){
  const errors = []
  if(!input.fullName) errors.push('fullName is required')
  if(!input.email || !isEmail(input.email)) errors.push('valid email required')
  if(!input.course) errors.push('course is required')
  if(input.graduationYear==null) errors.push('graduationYear is required')
  if(Number(input.graduationYear) < currentYear()) errors.push('graduationYear must be >= current year')
  if(input.score==null) errors.push('score is required')
  const s = Number(input.score)
  if(Number.isNaN(s) || s<0 || s>100) errors.push('score must be 0-100')
  return errors
}

module.exports = { validateStudent }
