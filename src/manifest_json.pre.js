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
        let hash
        try {
            hash = JSON.parse(headers.etag || null);
        } catch (e) {
            hash = headers.etag;
        }

        entries.push({
            path: paths[i],
            hash: hash
        })
    }
}

const addPage = async (entries, { secrets, request, logger }) => {
    const channelPath = request.params.path;
    const headers = await fetchPageHeaders(channelPath, { secrets, request, logger })
    let hash
    try {
        hash = JSON.parse(headers.etag || null);
    } catch (e) {
        hash = headers.etag;
    }

    entries.push({
        path: channelPath.replace(/\.md$/, '.html'),
        hash: hash
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
    visit(context.content.mdast, 'html', (node) => {
        const src = node.value.match(/\ src="(.*?)"/)
        if (src) {
            assets.push(src[1])
        }
    })
    await addStaticPaths(entries, assets, action)
}

const addAssetsInEmbeddedChannels = async (entries, context, action) => {
    const rp = require('request-promise-native')
    const protocol = context.request.headers['upgrade-insecure-requests'] ? 'http' : 'https'
    const host = context.request.headers.host
    const urlParentPath = context.request.url.split('/').slice(0, -1).join('/')
    
    // Find all embedded channels and generate their manifest url
    const embedRegExp = new RegExp(`^(markdown|html|embed): ?(.*(md|html))$`)
    let additionalManifests = []
    visit(context.content.mdast, 'inlineCode', (node) => {
        const matches = embedRegExp.exec(node.value)
        if (!matches || !matches[2]) {
            return
        }
        const page = matches[2].replace(/\.(html|md)$/, '')
        additionalManifests.push(`${protocol}://${host}${urlParentPath}/${page}.manifest.json`)
    })

    // Fetch all the manifests
    const manifests = await Promise.all(additionalManifests.map((path) => rp(path)))

    // Add assets from the manifest to the main manifest
    manifests.forEach((data) => {
        const json = JSON.parse(data)
        json.entries
            .filter((entry) => entry.path.indexOf('/content/screens/channels/') !== 0)
            .forEach((entry) => {
                if (!entries.some((e) => e.path === entry.path)) {
                    entries.push(entry)
                }
            })
    })
}

module.exports.after = {

    // List all entries with their hash in the manifest
    meta: async (context, { secrets, request, logger }) => {
        
        let entries = [];

        await addPage(entries, { secrets, request, logger })
        await addCSSandJS(entries, { secrets, request, logger })
        await addAssets(entries, context, { secrets, request, logger })
        await addAssetsInEmbeddedChannels(entries, context, { secrets, request, logger })

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
