const visitContent = require('./utils/visit-content').default

const prepareDeviceProps = (timestamp, devicePath, deviceProps) => {
    const preparedProps = Object.assign({}, deviceProps, {
        id: devicePath,
        path: devicePath,
        lastModified: timestamp
    })
    delete preparedProps.etag
    return preparedProps
}

const prepareDisplayProps = (timestamp, displayPath, deviceProps, displayProps) => {
    const preparedProps = Object.assign({}, displayProps, {
        path: displayPath,
        configPath: displayPath + '/' + deviceProps.path.split('/').slice(-1),
        lastModified: timestamp
    })
    delete preparedProps.etag
    return preparedProps
}

const prepareChannelProps = (timestamp, channePath, role, channelProps, channelReq) => {
    return Object.assign({}, channelProps, {
        path: channePath,
        role: role,
        title: channelReq.md ? channelReq.md.split(/\r?\n/).find((line) => line.match(/^#+ /)).replace(/#+ /, '') : '',
        lastModified: timestamp,
        offline: {
            enabled: true,
            manifestPath: `${channePath}.manifest.json`
        }
    })
}

module.exports.pre = () => {}

module.exports.after = {

    // Get the config for the device, display and all assigned channels
    meta: async (context, { secrets, request, logger }) => {
        
        let deviceProps, displayProps, channelsProps = []
        await visitContent(context, { secrets, request, logger },
            async (timestamp, path, props) => {
                deviceProps = prepareDeviceProps(timestamp, path, props)
            },
            async (timestamp, path, props) => {
                displayProps = prepareDisplayProps(timestamp, path, deviceProps, props)
            },
            async (timestamp, path, role, props, content) => {
                channelsProps.push(prepareChannelProps(timestamp, path, role, props, content))
            }
        )

        displayProps.channels = channelsProps

        delete deviceProps.display

        context.content.json = {
            "device": deviceProps,
            "display": displayProps
        }
    }
}