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
  return 'exactly'
}

const flexPrinter = (seconds) => {
  const flexDirection = getFlexDirectionText(seconds) // ahead/behind
  const positiveSeconds = Math.abs(seconds) //Deal with positive numbers - we're already got direction
  const dayInSeconds = 7.5 * 60 * 60 //7.5 hours in seconds
  const daysOfFlex = Math.floor(positiveSeconds / dayInSeconds)
  const remainingSeconds = positiveSeconds - (daysOfFlex * dayInSeconds)
  const readableDuration = humanizeDuration(remainingSeconds * 1000)

  let printerText = (daysOfFlex > 0 ? `${daysOfFlex} days, ` : '') //Number of days
  printerText += `${readableDuration} ${flexDirection}`
  return printerText
}

module.exports = {
  getTempoPeriodsUrl,
  getTempoWorklogsUrl,
  flexPrinter
}