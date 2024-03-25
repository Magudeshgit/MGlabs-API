const {ec2, costexplorer} = require('./utilities/awsconfig')
const express = require('express')
const cors = require('cors')
const bp = require("body-parser")
const exp = express()
exp.use(bp.urlencoded({extended: false}))
exp.use(bp.json())
exp.use(cors())

//AWS Methods
console.log("env", process.env.REACT_APP_AWS_ID)

async function getInstanceData(){ //To retrieve overall instances data
    const InstanceData = {
        InstanceName: '',
        InstanceID: '',
        IPAddress: '',
        Status: false
    }

    return new Promise((resolve,reject)=>{ ec2.describeInstances({DryRun:false}, async (err,data)=>{
        if(!err)
        {
            //console.log("dt", data['Reservations'][0]['Instances'])
            console.log("State ",data['Reservations'][0]['Instances'][0]['State']['Name'])
            InstanceData.InstanceID = data['Reservations'][0]['Instances'][0]['InstanceId']
            console.log("iname",await getInstanceName(InstanceData.InstanceID))
            InstanceData.InstanceName =  await getInstanceName(InstanceData.InstanceID)
            console.log(data['Reservations'][0]['Instances'][0]['State']['Name'])
            if (data['Reservations'][0]['Instances'][0]['State']['Name'] === 'running') InstanceData.Status = true; else InstanceData.Status = false
            InstanceData.IPAddress = '255.255.255.255'
            console.log("resolving")
            resolve(InstanceData)
        }
        else
        {
            console.log("Error")
            console.log(err)    
            reject(err)
        }
    })
    })
}

async function startInstance(instanceID){ //To Start an Instance
    let params = {
        InstanceIds: [instanceID],
        DryRun: false
    };

    return new Promise((resolve,reject)=>{ec2.startInstances(params, (err,data)=>{
        if (err)
        {
            reject(err)
        }
        else
        {
            resolve(data)
        }
        })
    })
}

async function rebootInstance(instanceID){ //To Start an Instance
    let params = {
        InstanceIds: [instanceID],
        DryRun: false
    };

    return new Promise((resolve,reject)=>{ec2.rebootInstances(params, (err,data)=>{
        if (err)
        {
            reject(err)
        }
        else
        {
            resolve(data)
        }
        })
    })
}

async function stopInstance(instanceID){ //To Start an Instance
    let params = {
        InstanceIds: [instanceID],
        DryRun: false
    };

    return new Promise((resolve,reject)=>{ec2.stopInstances(params, (err,data)=>{
        if (err)
        {
            reject(err)
        }
        else
        {
            resolve(data)
        }
        })
    })
}

function getStatus(instanceID) //Get Status info such as State and Status
{
    var params = {
        IncludeAllInstances: true,
        InstanceIds: ['i-0d9fffc559ba22742']
    }
    const data = new Promise((resolve,reject)=>{ec2.describeInstanceStatus(params, (err,data)=>{
        if (err)
        {
            reject(err)
        }
        else {
            resolve(
                {
                    "Status": (data['InstanceStatuses'][0]['InstanceState']['Name'] === "running")?true:false,
                    "Checks": data['InstanceStatuses'][0]['SystemStatus']['Status']
                }
                )
            // resolve(data['InstanceStatuses'][0])
            console.log("lkjlj",data['InstanceStatuses'][1])
        }
    })
    })

    return data.then(dt=>dt)
}

function getInstanceName(id) //Subsidiary function of getInstanceData to retrieve instance name
{
    const par = {
    Filters: [
            {
                Name: "resource-id",
                Values: [id]
            }
        ]
    }   
    return new Promise((resolve,reject)=>{
        ec2.describeTags(par, (err, data)=>{
            if (!err)
            {  
                resolve(data['Tags'][0]['Value'])
            }
            else
            {
                reject(err)
            }
        })
    })
}
function currencyRates()
{
    return new Promise((resolve, reject)=>{
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(currency=>currency.json())
        .then(currencyjson=>resolve(currencyjson.rates['INR']))
    })    
}
function getCostInfo()
{
    let date = new Date()
    let params = 
    {
        Granularity: 'MONTHLY',
        Metrics: ['UnblendedCost'],
        TimePeriod: {
            End: date.toLocaleDateString("en-CA"),//'2024-03-16',
            Start: date.getFullYear() + '-' + ((date.getMonth() < 10)?"0"+(1+date.getMonth()):date.getMonth()) + '-01'
        }
    }
    const data = new Promise((resolve, reject)=>{
        costexplorer.getCostAndUsage(params, (err,resp)=>{
            if (err)
            {
                console.log('err',err)
                reject(err)
            }
            else{
                console.log(resp)
                resolve(resp)
            }
        })
    })
    return data.then(dt=>{
        console.log
        const TimePeriod = dt['ResultsByTime'][0]["TimePeriod"]
        const Cost = dt['ResultsByTime'][0]["Total"]["UnblendedCost"] * currencyRates
        return [TimePeriod, Cost]
    })
}



// URL Methods
exp.get('/Instancedata', (req,resp)=>{
    console.log("New Request")
    getInstanceData().then((d)=>{
        console.log("ddd",d)
        resp.json(d)
    })
})

exp.get('/getStatus',(req,resp)=>{
    getStatus().then(data=>resp.json(data))
})

exp.get('/getcostdetails', (req,resp)=>{
    console.log("getting cost")
    getCostInfo().then(op=>{console.log(op); resp.json(op)})
})

exp.post('/startInstance', (req,resp)=>{
    startInstance(req.body['ID']).then(response=>{
        console.log('sds',response)
        resp.json(response)
    })
})

exp.post('/rebootInstance', (req,resp)=>{
    console.log('reboot requested')
    rebootInstance(req.body['ID']).then(response=>{
        console.log('sds',response)
        resp.json(response)
    })
})

exp.post('/stopInstance', (req,resp)=>{
    console.log('stop requested')
    stopInstance(req.body['ID']).then(response=>{
        console.log('sds',response)
        resp.json(response)
    })
})

const port = process.env.PORT || 4000

exp.listen(port, ()=>{
    console.log('Provider Running on port ', port + '!!!')
})