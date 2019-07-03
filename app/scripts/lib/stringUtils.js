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

const flexPrinter = (seconds) => {
  if(seconds == 0){
    return 'Your timesheet is balanced!'
  }
  const flexDirection = getFlexDirectionText(seconds) // ahead/behind
  const positiveSeconds = Math.abs(seconds) //Deal with positive numbers - we're already got direction
  const dayInSeconds = 7.5 * 60 * 60 //7.5 hours in seconds
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
  flexPrinter
}