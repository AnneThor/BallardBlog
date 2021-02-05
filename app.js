const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const app = express()
const port = process.env.PORT ? process.env.PORT : 8000
const routes = require('./routes/routes.js')
const auth = require('./config/auth.js')
const dbConnect = require('./config/database.js')

// Setting up access to .env secret variables
require('dotenv').config()

app.set('view engine', 'pug')

app.use(express.static(process.cwd() + '/public'))
app.use(cookieParser(process.env.SESSION_SECRET))
app.use(cookieSession({
  name: 'session', keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

const db = dbConnect()
routes(app, db)
auth(app, db)

app.listen(port, () => {
  console.log(`Example server listening at http://localhost:${port}`)
})
