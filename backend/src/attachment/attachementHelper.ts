import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const URLExpiration = process.env.S3_URL_EXPIRATION
const imageBucket = new XAWS.S3({
    signatureVersion: "v4",
})

export const genPresignUrl = async (reportId: string) => {
    const signedURL = await imageBucket.getSignedUrl("putObject", {
        Bucket: bucketName,
        Key: reportId,
        Expires: URLExpiration,
    });
    return signedURL;
}