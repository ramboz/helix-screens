module.exports = (req) => {
    return req.queryString.replace(/^\?/, '').split('&').reduce((params, str) => {
        const param = str.split('=')
        params[param[0]] = param[1]
        return params
    }, {})
}