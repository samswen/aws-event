'use strict';

module.exports = {
    get_message,
    get_type,
};

function get_type(event) {
    if (event.Records && Array.isArray(event.Records) && event.Records.length > 0 && event.Records[0].Sns) {
        return 'sns';
    }
    if (event.queryStringParameters) {
        return 'http';
    } else if (event.body) {
        return 'sqs';
    }  
    return 'json';
}

function get_message(event) {
    const type = get_type(event);
    if (type === 'sns') {
        return JSON.parse(event.Records[0].Sns.Message);
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