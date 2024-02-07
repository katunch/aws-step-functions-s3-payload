const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const s3 = new S3Client();

class S3PayloadUtils {
    static toCamelCase(input) {
        return input
            .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
            .replace(/\s/g, '')
            .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
    }

    static urlToS3Params(sourceUrl) {
        const url = new URL(sourceUrl);

        const params = {
            Bucket: url.hostname,
            Key: url.pathname.substring(1)
        }
        return params;
    }

    static s3ParamsToUrl(params) {
        return `s3://${params.Bucket}/${params.Key}`;
    }

    static contextToS3Params(context) {
        const params = {
            Bucket: process.env.S3_BUCKET || '',
            Key: `state-machines/${S3PayloadUtils.toCamelCase(context.StateMachine)}/${S3PayloadUtils.toCamelCase(context.Execution)}/${S3PayloadUtils.toCamelCase(context.State)}/output.json`
        }
        return params;
    }

    static async getPayloadFromS3(event) {
        if (event.input.payloadUrl && event.input.payloadUrl.startsWith('s3://')) {
            const params = S3PayloadUtils.urlToS3Params(event.input.payloadUrl);
            const getObjectCommand = new GetObjectCommand(params);
            const object = await s3.send(getObjectCommand);
            return JSON.parse(object.Body.toString())
        }
        return event.input;
    }

    static async savePayloadToS3(context, payload) {
        const params = S3PayloadUtils.contextToS3Params(context);
        params.Body = JSON.stringify(payload);
        const putObjectCommand = new PutObjectCommand(params);
        await s3.send(putObjectCommand);
        return S3PayloadUtils.s3ParamsToUrl(params);
    }
}

module.exports = S3PayloadUtils;