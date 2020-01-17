const dateToYYYYMMDD = (date) => {
    return date.toISOString().substring(0, 10)
}