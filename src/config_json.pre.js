const fetchMD = require('./utils/fetch-md').default
const fetchYAML = require('./utils/fetch-yaml').default
const getDevice = require('./utils/get-device').default

module.exports.pre = () => {}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        
        // Get the device properties
        const devicePath = getDevice(context.request)
        const deviceProps = await fetchYAML(`${devicePath}.yaml`, { request, logger })
        deviceProps.id = devicePath
        deviceProps.path = devicePath
        
        let displayProps = {}

        if (deviceProps.display) {
            
            // Get the display properties
            const displayPath = deviceProps.display
            displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
            displayProps.path = displayPath
            displayProps.configPath = displayPath + '/' + devicePath.split('/').slice(-1)
            
            // Get the channels properties
            let channels = []
            const channelRoles = Object.keys(displayProps.channels);
            for (let i = 0; i < channelRoles.length; i++) {
                const channePath = displayProps.channels[channelRoles[i]].path.replace(/\.(html|md)$/, '')
                const channelProps = displayProps.channels[channelRoles[i]];
                channelProps.path = channePath
                channelProps.role = channelRoles[i]
                const res = await fetchMD(`${channePath}.md`, { request, logger })
                channelProps.title = res.md ? res.md.split(/\r?\n/).find((line) => line.match(/^#+ /)).replace(/#+ /, '') : ''
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