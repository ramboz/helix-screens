const redirectSvcRequest = require('./utils/redirect-svc-requests').default
const visitContent = require('./utils/visit-content').default

module.exports.pre = () => {}

module.exports.before = {
    fetch: redirectSvcRequest
}

module.exports.after = {

    // Get the last modified for the device, display and all assigned channels
    meta: async (context, { secrets, request, logger }) => {
        
        let lastModified = -1
        await visitContent(context, { secrets, request, logger },
            async (timestamp) => {
                lastModified = isNaN(timestamp) ? timestamp : Math.max(lastModified, timestamp)
            },
            async (timestamp) => {
                lastModified = isNaN(timestamp) ? lastModified + '-' + timestamp : Math.max(lastModified, timestamp)
            },
            async (timestamp) => {
                lastModified = isNaN(timestamp) ? lastModified + '-' + timestamp : Math.max(lastModified, timestamp)
            }
        )

        context.content.json = { lastModified: lastModified }
    }
}
