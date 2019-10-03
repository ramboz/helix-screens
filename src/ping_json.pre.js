const fetchYAML = require('./fetch-yaml')

function getQueryParams(req) {
    return req.queryString.replace(/^\?/, '').split('&').reduce((params, str) => {
        const param = str.split('=')
        params[param[0]] = param[1]
        return params
    }, {})
}

module.exports.pre = () => {}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        try {
            const params = getQueryParams(context.request)
            const deviceProps = await fetchYAML(`/home/users/screens/we-retail/devices/${params.id}.yaml`, { request, logger })
            let lastModified = deviceProps.lastModified
            logger.log('info', '1>' + deviceProps.lastModified)

            if (deviceProps.configPath) {
                const displayPath = deviceProps.configPath.split('/').slice(0, -1).join('/')
                const displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
                logger.log('info', '2>' + displayProps.lastModified)
                lastModified = deviceProps.lastModified
            }

            logger.log('info', '0>' + lastModified)
            context.content.json = JSON.parse(context.content.body)
            context.content.json.lastModified = lastModified
        }
        catch (e) {
            context.content.json = {}
        }
    }
}
