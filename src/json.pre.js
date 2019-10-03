function pre(context) {
    try {
        context.content.json = JSON.parse(context.content.body)
    }
    catch (e) {
        context.content.json = {}
    }
}

module.exports.pre = pre
