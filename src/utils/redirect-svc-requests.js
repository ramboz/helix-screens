module.exports =  (context, { request, logger }) => {
    if (request.params.path.match(/_jcr_content\.md$/)) {
        request.params.path = '/content/screens/svc.md'
    }
}