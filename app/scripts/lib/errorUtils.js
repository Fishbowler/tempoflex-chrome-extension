export default class TempoError extends Error {
    constructor(message){
        super(message)
        this.name = 'TempoError'
    }
}
