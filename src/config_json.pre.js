const fetchMD = require('./fetch-md')
const fetchYAML = require('./fetch-yaml')
const fetchPageHeaders = require('./fetch-page-headers')
const getQueryParams = require('./get-query-parameters')

module.exports.pre = () => {}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        
        // Get the device properties
        const params = getQueryParams(context.request)
        const deviceId = decodeURIComponent(params.id);
        const devicePath = deviceId.indexOf('/') === 0 ? deviceId : `/devices/${deviceId}`
        const deviceProps = await fetchYAML(`${devicePath}.yaml`, { request, logger })
        deviceProps.id = devicePath
        deviceProps.path = devicePath
        
        let displayProps = {}

        if (deviceProps.display) {
            
            // Get the display properties
            const displayPath = deviceProps.display
            displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
            displayProps.path = displayPath
            displayProps.configPath = displayPath + '/device'
            
            // Get the channels properties
            let channels = []
            const channelRoles = Object.keys(displayProps.channels);
            for (let i = 0; i < channelRoles.length; i++) {
                const channePath = displayProps.channels[channelRoles[i]].path.replace(/\.(html|md)$/, '')
                const channelProps = displayProps.channels[channelRoles[i]];
                channelProps.path = channePath
                channelProps.role = channelRoles[i]
                const res = await fetchMD(`${channePath}.md`, { request, logger })
                channelProps.title = res.md.split(/\r?\n/).find((line) => line.match(/^#+ /)).replace(/#+ /, '')
                channelProps.lastModified = res.etag
                channelProps.offline = {
                    enabled: true,
                    manifestPath: `${channePath}.manifest.json`
                }
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