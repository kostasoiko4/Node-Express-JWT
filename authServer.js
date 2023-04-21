require('dotenv').config()

const { response, request } = require('express')
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

//Use database not let in production
let refreshTokens = []

app.post('/token', (request, response) => {
    const refreshToken = request.body.token

    if (refreshToken == null) return response.sendStatus(401)

    if(!refreshTokens.includes(refreshToken)) return response.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return response.sendStatus(403)

        const accessToken = generateAccessToken({name: user.name})
        response.json({accessToken: accessToken})
    })
})

app.delete('/logout', (request, response) => {
    //Production: Delete from database
    refreshTokens = refreshTokens.filter(token => token !== request.body.token)
    response.sendStatus(204)
})

app.post('/login', (request, response) => {
    //Authenticate User

    const username = request.body.username
    const user = {name: username}


    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    
    refreshTokens.push(refreshToken)

    response.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'}) //10 Mins
}

app.listen(4000)