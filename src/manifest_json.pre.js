const visit = require('unist-util-visit')
const redirectSvcRequest = require('./utils/redirect-svc-requests').default
const fetchPageHeaders = require('./utils/fetch-page-headers').default

module.exports.pre = () => {}

module.exports.before = {
    fetch: redirectSvcRequest
}

const addStaticPaths = async (entries, paths, action) => {
    for (let i in paths) {
        const headers = await fetchPageHeaders(`/htdocs${paths[i]}`, action)
        const hash = JSON.parse(headers.etag);
        entries.push({
            path: paths[i],
            hash: hash
        })
    }
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
    await addStaticPaths(entries, [
        '/design.css',
        '/sequencechannel-embed.css',
        '/sequencechannel-embed.js'
    ], action)
}

const addAssets = async (entries, context, action) => {
    const assets = []
    visit(context.content.mdast, 'image', (node) => {
        assets.push(node.url)
    })
    await addStaticPaths(entries, assets, action)
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
