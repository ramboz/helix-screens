const fetchYAML = require('./fetch-yaml')

function getQueryParams(req) {
    return req.queryString.replace(/^\?/, '').split('&').reduce((params, str) => {
        const param = str.split('=')
        params[param[0]] = param[1]
        return params
    }, {})
}

async function pre(context, { request, logger }) {
    try {
        const params = getQueryParams(context.request)
        const yaml = await fetchYAML(`/home/users/screens/we-retail/devices/${params.id}.yaml`, { request, logger })
        logger.log('info', '1>' + yaml)
        context.content.json = JSON.parse(context.content.body)
        context.content.json.lastModified = Date.now()
    }
    catch (e) {
        context.content.json = {}
    }
}

module.exports.pre = pre
