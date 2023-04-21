require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json())

const posts = [
    {
        username: 'Petros',
        title: 'Post 1'
    },
    {
        username: 'Ilias',
        title: 'Post 2'
    }
]

app.get('/posts', authenticateToken, (request, response) => {
    response.json(posts.filter(post => post.username === request.user.name))
})

function authenticateToken(request, response, next){
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return response.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return response.sendStatus(403)

        request.user = user
        next()
    })
}

app.listen(3000)