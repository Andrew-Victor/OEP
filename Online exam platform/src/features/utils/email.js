// const nodemailer = require('nodemailer')

// const sendEmail = async (options) => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: 'sandbox.smtp.mailtrap.io',
//     port: 2525,
//     secure: false,
//     auth: {
//       user: '44bf58c63240bd',
//       pass: 'e0d06bf70aa0b2',
//     },
//     tls: {
//       // do not fail on invalid certs
//       rejectUnauthorized: false,
//     },
//   })
//   transporter.verify(function (error, success) {
//     if (error) {
//       console.log(error)
//     } else {
//       console.log('Server is ready to take our messages')
//     }
//   })

//   // 2) Define the email optSions
//   const mailOptions = {
//     from: 'EELU <victorandrew292@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   }

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions)
// }

//module.exports = sendEmail

// const emailjs = require('emailjs')

// const client = new emailjs.SMTPClient({
//   user: '44bf58c63240bd',
//   password: 'e0d06bf70aa0b2',
//   host: 'sandbox.smtp.mailtrap.io',
//   ssl: true,
//   port: 25,
//   authentication: 'LOGIN',
//   tls: false,

// })
// const sendMessage = async (options) => {
//   const message = {
//     text: options.text,
//     from: options.from,
//     to: options.to,
//     cc: options.cc,
//   }

//   // send the message and get a callback with an error or details of the message that was sent
//   client.send(message, function (err, message) {
//     console.log(err || message)
//   })
// }
// // you can continue to send more messages with successive calls to 'client.send',
// // they will be queued on the same smtp connection

// // or instead of using the built-in client you can create an instance of 'smtp.SMTPConnection'

const Resend = require('resend')

const resend = new Resend.Resend('re_gKT8zEd6_43qLv3DjYWimZkmy4qTG3V3T')

const sendEmail = async function (options) {
  const { data, error } = await resend.emails.send({
    from: 'EELU <delivered@resend.dev>',
    to: [options.to],
    subject: options.subject,
    text: options.text,
  })

  if (error) {
    console.error({ error })
    return false
  }

  console.log({ data })
  return true
}

module.exports = sendEmail
