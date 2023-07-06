import grant from 'grant'
import dotenv from 'dotenv'
dotenv.config()
console.log('grant origin:', process.env.ORIGIN)

export let grantMiddleware = grant.express({
  defaults: {
    origin: process.env.ORIGIN,
    transport: 'session',
    state: true,
  },
  google: {
    key: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    scope: ['email','profile'],
    callback: '/login/google',
  },
})