const AWS=require('aws-sdk')


const mycredentials = 
{
    accessKeyId: 'AKIA5U6V7VS5IDSSNYGG',
    secretAccessKey: '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'
}
AWS.config.credentials = mycredentials

const ec2 = new AWS.EC2(
    {
        credentials: mycredentials, region: 'eu-north-1', apiVersions: '2016-11-15'
    }
)

module.exports = ec2