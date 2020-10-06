const dateToYYYYMMDD = (date) => {
    return date.toISOString().substring(0, 10)
}

const todayString = () => {
    return dateToYYYYMMDD(new Date())
}

const tomorrowString = () => {
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return dateToYYYYMMDD(tomorrow)
}

const jan1stString = () => {
    let jan1st = new Date(new Date().getFullYear(), 0, 1);
    return dateToYYYYMMDD(jan1st)
}

module.exports = {
    dateToYYYYMMDD,
    todayString,
    tomorrowString,
    jan1stString
}