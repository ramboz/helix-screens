const redirectSvcRequest = require('./utils/redirect-svc-requests').default
const fetchYAML = require('./utils/fetch-yaml').default
const fetchPageHeaders = require('./utils/fetch-page-headers').default
const fetchLastCommit = require('./utils/fetch-last-commit').default
const getDevice = require('./utils/get-device').default

module.exports.pre = () => {}

module.exports.before = {
    fetch: redirectSvcRequest
}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { secrets, request, logger }) => {
        
        // Get the device etag
        const devicePath = getDevice(context.request)
        const deviceProps = await fetchYAML(`${devicePath}.yaml`, { request, logger })
        let commitInfo = await fetchLastCommit(`${devicePath}.yaml`, { secrets, request, logger })

        let lastModified = commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : -1
        
        if (deviceProps.display) {
            
            // Get the display etag
            const displayPath = deviceProps.display
            const displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
            commitInfo = await fetchLastCommit(`${displayPath}.yaml`, { secrets, request, logger })

            lastModified = Math.max(lastModified, commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : -1)
            
            // Get the channels etags
            const channelRoles = Object.keys(displayProps.channels);
            for (let i = 0; i < channelRoles.length; i++) {
                const channePath = displayProps.channels[channelRoles[i]].path.replace(/\.(html|md)$/, '')
                const commitInfo = await fetchLastCommit(`${channePath}.md`, { request, logger })

                lastModified = Math.max(lastModified, commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : -1)
            }
            
        }

        context.content.json = {lastModified: lastModified}
    }
}
