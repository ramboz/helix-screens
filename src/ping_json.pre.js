const fetchYAML = require('./fetch-yaml')
const fetchPageHeaders = require('./fetch-page-headers')
const getQueryParams = require('./get-query-parameters')

module.exports.pre = () => {}

module.exports.before = {
    fetch: async (context, { request, logger }) => {
        if (request.params.path.match(/_jcr_content\.md$/)) {
            request.params.path = '/content/screens/svc.md'
        }
    }
}
module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { request, logger }) => {
        
        // Get the device etag
        const params = getQueryParams(context.request)
        const deviceId = decodeURIComponent(params.id);
        const devicePath = deviceId.indexOf('/') === 0 ? deviceId : `/devices/${deviceId}`
        const deviceProps = await fetchYAML(`${devicePath}.yaml`, { request, logger })
        
        let etag = deviceProps.etag
        
        if (deviceProps.display) {
            
            // Get the display etag
            const displayPath = deviceProps.display
            const displayProps = await fetchYAML(`${displayPath}.yaml`, { request, logger })
            
            etag += `-${displayProps.etag}`
            
            // Get the channels etags
            const channelRoles = Object.keys(displayProps.channels);
            for (let i = 0; i < channelRoles.length; i++) {
                const channePath = displayProps.channels[channelRoles[i]].path.replace(/\.(html|md)$/, '')
                const headers = await fetchPageHeaders(`${channePath}.md`, { request, logger })
                
                etag += `-${JSON.parse(headers.etag || null)}`
            }
            
        }

        context.content.json = {lastModified: etag}
    }
}
