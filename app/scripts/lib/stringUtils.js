const humanizeDuration = require('humanize-duration')

const getTempoPeriodsUrl = (settings) => {
  const relativePath = `/rest/tempo-timesheets/4/timesheet-approval/approval-statuses/?userKey=${settings.username}&numberOfPeriods=${settings.periods}`
  const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
  return tempoUrl
}

const getTempoWorklogsUrl = (settings) => {
  const relativePath = '/rest/tempo-timesheets/4/worklogs/search'
  const tempoUrl = new URL(relativePath, settings.jiraBaseUrl).toString()
  return tempoUrl
}

const getFlexDirectionText = (flex) => {
  if (flex < 0) {
    return 'behind'
  }
  if (flex > 0) {
    return 'ahead'
  }
  return ''
}

const getFlexString = (secondsOfFlex, hoursPerDay) => {
  if(secondsOfFlex == 0){
    return 'Your timesheet is balanced!'
  }
  const flexDirection = getFlexDirectionText(secondsOfFlex) // ahead/behind
  const positiveSeconds = Math.abs(secondsOfFlex) //Deal with positive numbers - we're already got direction
  const dayInSeconds = hoursPerDay * 60 * 60
  const daysOfFlex = Math.floor(positiveSeconds / dayInSeconds)

  let printerText = ''

  //Deal with whole days
  let dayText = ''
  switch (daysOfFlex){
    case 0:
      break;
    case 1:
      dayText = '1 day'
      break;
    default:
      dayText = `${daysOfFlex} days`
  }

  printerText += dayText

  //Deal with the remainder
  let remainingText = ''
  const remainingSeconds = positiveSeconds - (daysOfFlex * dayInSeconds)
  if(remainingSeconds > 0){
    if(daysOfFlex > 0){
      printerText += ', ' //concatenate like a human
    }
    remainingText = humanizeDuration(remainingSeconds * 1000)
  }

  printerText += remainingText
  printerText += ` ${flexDirection}`
  return printerText
}

module.exports = {
  getTempoPeriodsUrl,
  getTempoWorklogsUrl,
  getFlexString
}