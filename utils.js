module.exports = {
    makeid,
}

function makeid(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let index = 0; index < array.length; index++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}