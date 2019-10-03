const fetchYAML = require('./fetch-yaml')
const fetchPageHeaders = require('./fetch-page-headers')
const getQueryParams = require('./get-query-parameters')

module.exports.pre = () => {}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        const params = getQueryParams(context.request)
        const devicePath = decodeURIComponent(params.id)
        const deviceProps = await fetchYAML(`${devicePath}.yaml`, { request, logger })
        deviceProps.path = devicePath
        
        let displayProps = {}
        let channels = []
        if (deviceProps.display) {
            const displayPath = deviceProps.display
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
                channelProps.lastModified = JSON.parse(headers.etag)
                channels.push(channelProps)
            }
            displayProps.channels = channels
        }

        deviceProps.configPath = deviceProps.display + '/device'
        delete deviceProps.display

        context.content.json = {
            "device": deviceProps,
            "display": displayProps
        }
    }
}