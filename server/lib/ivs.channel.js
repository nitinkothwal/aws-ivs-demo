const AWS = require('./aws');
const ivs = new AWS.IVS();

const LATENCY_MODE = Object.freeze({
    NORMAL: "NORMAL",
    LOW: "LOW"
});

const CHANNEL_TYPE = Object.freeze({
    STANDARD: "STANDARD",
    BASIC: "BASIC"
});

/**
 * Creates a new channel and an associated stream key to start streaming.
 * @param {string} name
 * @param {any} tags
 * @param {boolean} authorized
 */
async function createChannel(name, tags, authorized) {
    const params = {
        //authorized: !!authorized, // authorization is disabled.
        latencyMode: LATENCY_MODE.LOW,
        name: name,
        tags: tags? tags: {},
        type: CHANNEL_TYPE.STANDARD
    };
    return await promisify('createChannel', params);
}

/**
 * Inserts metadata into an RTMPS stream for the specified channel.
 * A maximum of 5 requests per second per channel is allowed, each with a maximum 1KB payload.
 * @param {string} channelArn 
 * @param {string} metadata 
 */
async function putMetadata(channelArn, metadata) {
    const params = {
        channelArn: channelArn,
        metadata: metadata
    };
    return await promisify('putMetadata', params);
}

/**
 * List IVS channels.
 * @param {any} params
 */
async function listChannels(params) {
    return await promisify('listChannels', params);
}

/**
 * Batch get channel.
 * @param {any} params
 */
async function batchGetChannel(params) {
    return await promisify('batchGetChannel', params);
}

/**
 * Batch get stream key.
 * @param {any} params
 */
async function batchGetStreamKey (params) {
    return await promisify('batchGetStreamKey', params);
}

/**
 * Get stream keys of channel
 * @param {string} arn
 */
async function listStreamKeys(arn) {
    const params = {
        channelArn: arn
    };
    return await promisify('listStreamKeys', params);
}

/**
 * List all channel stream ARN
 * @param {any} arn 
 */
async function listAllStreamKeys(arn) {
    const response = await listStreamKeys(arn);
    let list = [];
    if (response && response.streamKeys && response.streamKeys.length > 0) {
        const arns = [];
        response.streamKeys.forEach((key) => {
            arns.push(key.arn);
        });

        const resp2 = await batchGetStreamKey({
            arns
        });
        list = resp2 && resp2.streamKeys || [];
    }
    return list;
}

/**
 * List channels in detail
 */
async function listAllChannels() {
    const response = await listChannels();
    let list = [];
    if (response && response.channels && response.channels.length > 0) {
        const arns = [];
        response.channels.forEach((channel) => {
            arns.push(channel.arn);
        });
        
        const resp2 = await batchGetChannel({
            arns
        });
        list = resp2 && resp2.channels || [];
        list = list.map((channel) => {
            channel.ingestUrl = `rtmps://${channel.ingestEndpoint}:443/app/`;
            return channel;
        });
    }
    return list;
}

async function deleteChannel(arn) {
    const params = {
        arn: arn
    };
    return await promisify('deleteChannel', params);
}

async function createStreamKey(channelArn) {
    const params = {
        channelArn: channelArn
    };
    return await promisify('createStreamKey', params);
}

async function deleteStreamKey(arn) {
    const params = {
        arn: arn
    };
    return await promisify('deleteStreamKey', params);
}

async function stopStream(channelArn) {
    const params = {
        channelArn: channelArn
    };
    return await promisify('stopStream', params);
}

async function deleteChannelStreamKeys(channelArn) {
    const response = await listStreamKeys(channelArn);
    if (response && response.streamKeys && response.streamKeys.length > 0) {
        response.streamKeys.forEach(async (key) => {
            await deleteStreamKey(key.arn);
        });
    }
}

/**
 * Get channel stream
 * Response contain info: state (LIVE | OFFLINE), viewerCount, playbackUrl
 * More details: https://docs.aws.amazon.com/ivs/latest/APIReference/API_GetStream.html
 * @param {string} channelArn Channel ARN
 */
async function getStream(channelArn) {
    const params = {
        channelArn: channelArn
    };
    return await promisify('getStream', params);
}

async function promisify(functn, params) {
    return new Promise((resolve, reject) => {
        const param = params? params: {};
        ivs[functn](param, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

module.exports = {
    createChannel,
    putMetadata,
    listChannels,
    batchGetChannel,
    batchGetStreamKey,
    listAllChannels,
    listStreamKeys,
    listAllStreamKeys,
    createStreamKey,
    deleteChannelStreamKeys,
    stopStream,
    getStream,
    deleteChannel
}
