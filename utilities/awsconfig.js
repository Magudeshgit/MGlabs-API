const AWS=require('aws-sdk')

const mycredentials = 
{
    accessKeyId: process.env.ACCESS_KEY || '',
    secretAccessKey: process.env.SECRET_KEY
}

console.log(process.env.SECRET_KEY)

console.log(mycredentials)

AWS.config.credentials = mycredentials

const ec2 = new AWS.EC2(
    {
        credentials: mycredentials, 
        region: 'eu-north-1', 
        apiVersions: '2016-11-15'
    }
)
const costexplorer = new AWS.CostExplorer(
    {
        credentials: mycredentials, 
        apiVersions: '2017-10-25'
    }
);

module.exports = ec2
module.exports = costexplorer