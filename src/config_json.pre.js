const fetchYAML = require('./fetch-yaml')
const fetchPageHeaders = require('./fetch-page-headers')
const getQueryParams = require('./get-query-parameters')

module.exports.pre = () => {}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        const params = getQueryParams(context.request)
        const deviceProps = await fetchYAML(`${params.id}.yaml`, { request, logger })
        deviceProps.path = params.id
        
        
        let displayProps = {}
        let channels = []
        if (deviceProps.configPath) {
            const displayPath = deviceProps.displayPath
            displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
            displayProps.path = displayPath
            displayProps.configPath = displayPath + '/device'
            const channelRoles = Object.keys(displayProps.channels);
            for (let i = 0; i < channelRoles.length; i++) {
                const channePath = displayProps.channels[channelRoles[i]].path.replace(/\.(html|md)$/, '')
                const channelProps = displayProps.channels[channelRoles[i]];
                channelProps.path = channePath
                channelProps.role = channelRoles[i]
                channelProps.title = ''
                const headers = await fetchPageHeaders(`${channePath}.md`, { request, logger })
                channelProps.lastModified = new Date(headers.etag).getTime()
                channels.push(channelProps)
            }
            displayProps.channels = channels
        }

        deviceProps.configPath = deviceProps.displayPath + '/device'
        delete deviceProps.displayPath

        context.content.json = {
            "device": deviceProps,
            "display": displayProps
        }
    }
}