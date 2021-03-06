'use strict';

module.exports = {
    get_message,
    get_type,
};

function get_type(event, context) {
    if (event.Records && Array.isArray(event.Records) && event.Records.length > 0) {
        if (event.Records[0].Sns) return 'sns';
        if (event.Records[0].s3) return 's3';
    }
    if (event.queryStringParameters) {
        return 'http';
    } else if (event.body) {
        return 'sqs';
    } 
    if (Object.keys(event).length === 0 || (context && context.clientContext)) {
        return 'invoke';
    }
    return 'json';
}

function get_message(event, context) {
    const type = get_type(event, context);
    if (type === 'sns') {
        const message = JSON.parse(event.Records[0].Sns.Message);
        if (message.Records) return get_message(message);
        else return message;
    }
    if (type === 's3') {
        return event.Records[0].s3;
    }
    if (type === 'http') {
        const message = {};
        if (event.queryStringParameters) {
            for (const key in event.queryStringParameters) {
                message[key] = event.queryStringParameters[key];
            }
        }
        if (event.body) {
            const body = get_body(event);
            if (body && typeof body === 'object') {
                for (const key in body) {
                    message[key] = body[key];
                }
            }
        }
        return message;
    }
    if (type === 'invoke' && context && context.clientContext) {
        return context.clientContext;
    }
    if (type === 'sqs') {
        return get_body(event);
    }   
    return event;
}

function get_body(event) {
    try {
        if (event.isBase64Encoded) {
            return JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8'));
        } else if (typeof event.body === 'string') {
            return JSON.parse(event.body);
        } else {
            return event.body;
        }
    } catch(err) {
        console.error(err);
        return event.body;
    }
}