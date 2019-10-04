const visit = require('unist-util-visit')
const redirectSvcRequest = require('./utils/redirect-svc-requests').default
const fetchPageHeaders = require('./utils/fetch-page-headers').default

module.exports.pre = () => {}

module.exports.before = {
    fetch: redirectSvcRequest
}

module.exports.after = {

    // Load embeds with layout defined in the matching yaml file if available
    meta: async (context, { request, logger }) => {
        
        const channelPath = request.params.path;

        let headers = await fetchPageHeaders(channelPath, { request, logger })
        const channelHash = JSON.parse(headers.etag);

        headers = await fetchPageHeaders('/htdocs/design.css', { request, logger })
        const designHash = JSON.parse(headers.etag);
        
        headers = await fetchPageHeaders('/htdocs/sequencechannel-embed.css', { request, logger })
        const cssHash = JSON.parse(headers.etag);
        
        headers = await fetchPageHeaders('/htdocs/sequencechannel-embed.js', { request, logger })
        const jsHash = JSON.parse(headers.etag);

        const entries = [];
        visit(context.content.mdast, 'image', (node) => {
            entries.push(node.url)
        })

        for (let i = 0; i < entries.length; i++) {
            headers = await fetchPageHeaders(`/htdocs${entries[i]}`, { request, logger })
            entries[i] = {
                path: entries[i],
                hash: JSON.parse(headers.etag)
            }
        }

        entries.push({
            path: channelPath.replace(/\.md$/, '.html'),
            hash: channelHash
        })
        entries.push({
            path: '/design.css',
            hash: designHash
        })
        entries.push({
            path: '/sequencechannel-embed.css',
            hash: cssHash
        })
        entries.push({
            path: '/sequencechannel-embed.js',
            hash: jsHash
        })

        context.content.json = {
            contentDelivery: {
                defaultProvider: "helix-screens",
                providers: [{
                    name: "helix-screens",
                        endpoint: "/"
                    }
                ]
            },
            timestamp: Date.now(),
            entries: entries
        }
    }
}
