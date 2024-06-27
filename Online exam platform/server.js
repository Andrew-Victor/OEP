const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const authRouter = require('./src/features/Authentication/route')
const studentRouter = require('./src/features/Student/StudentsRouter')
const examRouter = require('./src/features/Exam/ExamRouter')
const adminRouter = require('./src/features/Admin/AdminRouter')
const reportRouter = require('./src/features/Report/ReportRouter')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cors = require('cors')

//database
const DB = process.env.DB_STRING
mongoose
  .connect(DB)
  .then((connectionObject) => {
    console.log('sucessfully connected to database ! ')
  })
  .catch((err) => {
    console.log('error connecting to database')
    console.log(err)
  })

const app = express()

const limiter = rateLimit({
  max: 200,
  windowMS: 60 * 60 * 1000,
  message: 'TOO many requests from this ip please try again later ',
})
const corsOptions = {
  origin: '', //put localhost of front end here hussin habyby <3
  optionsSuccessStatus: 200,
}
//Middlewares
app.use(
  '/sus',
  express.static(
    'C:/Users/victo/OneDrive/Desktop/Project/CV server RealTime Server/sus'
  )
)
app.use(cors())

app.use(helmet())
//Body parser
app.use(express.json())
// Data santize against NoSqlQuery
app.use(mongoSanitize())
//Data santize against XSS
app.use(xss())
// limit Student Requests
// it will allow 100  requests per ip in one hour
app.use('/students', limiter)

app.use((req, res, next) => {
  console.log(
    `Request path is ${req.path}  and request method is ${req.method}`
  )

  next()
})

//Routes

app.use('/', authRouter)
app.use('/students', studentRouter)
app.use('/exams', examRouter)
app.use('/admins', adminRouter)
app.use('/report', reportRouter)

//127.0.0.1/4000/exams

app.listen(4000, () => {
  console.log(`yarab satrk!`)
})
