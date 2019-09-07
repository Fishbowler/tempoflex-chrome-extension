class TempoError extends Error {
    constructor(message){
        super(message)
        this.name = 'TempoError'
    }
}

module.exports = {TempoError}