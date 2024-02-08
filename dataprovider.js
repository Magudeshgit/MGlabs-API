const express = require('express')
const cors = require('cors')
const bp = require("body-parser")
const exp = express()
exp.use(bp.urlencoded({extended: false}))
exp.use(bp.json())
exp.use(cors())


exp.get('/githubaccess', async (req,resp)=>{
    console.log('incoming request')
    const CODE = req.query.code
    const CLIENT_ID = '750195eef141e27ece65'
    const CLIENT_SECRET = "315ed42e046290671d6a004a3d4d727a8a325a0b"
    const api = await fetch(
        'https://github.com/login/oauth/access_token?client_id=' + CLIENT_ID + '&client_secret='+ CLIENT_SECRET +'&code='+CODE,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        })
    const dt = await api.json()    
    console.log(dt)
    resp.json(dt)
})

exp.get('/getuser', async (req,resp)=>{
    const token = req.query.access_token
    console.log(token)
    const headerList =  {
        method:'GET',
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
    console.log(headerList)
    const ft = await fetch('https://api.github.com/user', headerList)

    const dat = await ft.json()
    console.log(dat)
    resp.json(dat)
    
})

exp.listen(4000, ()=>{
    console.log('Provider Running!!!')
})