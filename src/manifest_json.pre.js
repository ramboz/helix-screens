const visit = require('unist-util-visit')
const redirectSvcRequest = require('./utils/redirect-svc-requests').default
const fetchPageHeaders = require('./utils/fetch-page-headers').default

module.exports.pre = () => {}

module.exports.before = {
    fetch: redirectSvcRequest
}

const addPage = async (entries, { request, logger }) => {
    const channelPath = request.params.path;
    const headers = await fetchPageHeaders(channelPath, { request, logger })
    const channelHash = JSON.parse(headers.etag);

    entries.push({
        path: channelPath.replace(/\.md$/, '.html'),
        hash: channelHash
    })
}

const addCSSandJS = async (entries, action) => {
    let headers = await fetchPageHeaders('/htdocs/design.css', action)
    const designHash = JSON.parse(headers.etag);
    
    headers = await fetchPageHeaders('/htdocs/sequencechannel-embed.css', action)
    const cssHash = JSON.parse(headers.etag);
    
    headers = await fetchPageHeaders('/htdocs/sequencechannel-embed.js', action)
    const jsHash = JSON.parse(headers.etag);

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
}

const addAssets = async (entries, context, { request, logger }) => {
    const assets = []
    visit(context.content.mdast, 'image', (node) => {
        assets.push(node.url)
    })

    for (let i = 0; i < assets.length; i++) {
        const headers = await fetchPageHeaders(`/htdocs${assets[i]}`, { request, logger })
        entries.push({
            path: assets[i],
            hash: JSON.parse(headers.etag)
        })
    }
}

module.exports.after = {

    // List all entries with their hash in the manifest
    meta: async (context, { secrets, request, logger }) => {
        
        let entries = [];

        await addPage(entries, { secrets, request, logger })
        await addCSSandJS(entries, { secrets, request, logger })
        await addAssets(entries, context, { secrets, request, logger })

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
