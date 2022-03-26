'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    if (request.uri.endsWith('/')) {
        request.uri += 'index.html'
    }

    callback(null, request);
}
