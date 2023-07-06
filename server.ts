import express from 'express';
// import { Server } from 'http';
import { print } from 'listening-on';
import { postRoute } from "./post";
import { replyRoute } from "./reply";
import { cyan, reset } from 'asciichart';
import { uploadDir } from './upload';
import { Server as SocketIO } from 'socket.io';
import http from 'http';
import { homepageRoute } from "./homepage";
import { loginRoute } from "./login";
// import expressSession from 'express-session';
import { sessionMiddleware } from './session';
import { client } from './db';
import { grantMiddleware } from './googlegrant';
import { aboutRoute } from './about';



let app = express();

const server = new http.Server(app);
export const io = new SocketIO(server);

io.on('connection', function (socket) {
  
});

// app.use((req,res,next)=>{
// io.emit('hi', 'hihi')
// next()
// })

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));

app.use(express.json())
app.use(sessionMiddleware)

app.use(grantMiddleware)

app.use(homepageRoute)
app.use(loginRoute)
app.use(postRoute)
app.use(replyRoute)
app.use(aboutRoute)
app.use('/uploads', express.static(uploadDir))

import { ioRoute } from './ioUSe';
app.use(ioRoute);



function d2(x: number): string {
  if (x < 10) {
    return '0' + x
  }
  return String(x)
}

app.use((req, res, next) => {
  let date = new Date()
  let y = date.getFullYear()
  let m = d2(date.getMonth() + 1)
  let d = d2(date.getDate())
  let H = d2(date.getHours())
  let M = d2(date.getMinutes())
  let S = d2(date.getSeconds())

  console.log(
    `[${cyan}${y}-${m}-${d} ${H}:${M}:${S}${reset}] ${req.method} ${req.url}`,
  )
  next()
})



io.on('connection', (socket) => {

  socket.on('Inputting model', (model) => {
    client.query(`select number_of_seats, engineer_volume, auto_transmission, price from car where model=$1 and manufacturer_id=$2 order by id limit 20`, [model.model, model.manuId])
      .then( (result:any) => {


        if (result.rows.length > 0) {
          let priceSet: number[] = []
          result.rows.forEach( (rows:any) => priceSet.push(parseInt(rows.price)))

          let averagePrice = priceSet.reduce((acc, prev) => acc + prev, 0) / priceSet.length
          let info = {
            'number_of_seats': result.rows[0].number_of_seats,
            'engineer_volume': result.rows[0].engineer_volume,
            'auto_transmission': result.rows[0].auto_transmission,
            'price': averagePrice
          }


          return info
        }
      })

      .then( (info:any) => { io.emit('car detail', info) })
      .catch( (err:any) => {
        console.log(err)
      })
  })
})

io.on('connection', (socket) => {
  socket.on('Selected manufacturer', (id) => {
    client.query(`select model from car where manufacturer_id=$1 and type=$2`, [id.manuId, id.typeId])
      .then( (result:any) => { if (result.rows.length >= 0) { return result.rows } })
      .then( (model:any) => { io.emit('modellist', model) })
  })
})

io.on('connection', (socket) => {
  socket.on('Favourite post', async (like) => {
    try {

      await client.query(`insert into like_posts (users_id, post_id) VALUES ($1, $2)`, [like.userId, like.postId])
      let res = await client.query(`select count(*) from like_posts where post_id=$1`, [like.postId])
      res = res.rows[0].count
      let votedNumber = res
      if (+res > 0) {
        io.emit('like Number', { votedNumber })
      }
    } catch (error) {
      console.log(error)
    }
  })
})

io.on('connection', (socket) => {
  socket.on('Delete favourite post', async (like) => {
    try {
      await client.query(`delete from like_posts where users_id=$1 and post_id=$2`, [like.userId, like.postId])
      let res = await client.query(`select count(*) from like_posts where post_id=$1`, [like.postId])
      res = res.rows[0].count
      //let votedNumber = res

      io.emit('like Number', { votedNumber:res })

    } catch (error) {
      console.log(error)
    }
  })
})

let port = 8100
server.listen(port, () => { print(port) })

// app.use(ioRoute)