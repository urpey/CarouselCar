import express, { query } from 'express'
import { client } from './db'
import { Request, Response } from 'express';
import "./session";
export let aboutRoute = express.Router()
import {io} from './server'
import { Server } from 'http';

aboutRoute.get(`/userinfo/:id`, async (req, res) => {
    let id = +req.params.id

    if (!id) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return}
        let result = await client.query(`select phone, displayname from users where id = $1`, [id])
        let userinfo= result.rows[0]
        let postCount = await client.query(`select count(*) from post where users_id = $1`,[id])
        postCount=postCount.rows[0].count
        res.json({userinfo,postCount});
        

    })


    aboutRoute.get(`/userpost/:id`, async (req, res) => {
        let id = +req.params.id
    
        if (!id) {
            res.status(400).json({
                error: 'Missing id in req.params'
            })
            return}
            let result = await client.query(`SELECT 
          car.id as car_id,
          post.id as post_id,
          manufacturer.manufacturer_name as manufacturer_name,
          car.model as model,
          car.price as price,
          car.image1 as car_image
          FROM car
          inner join manufacturer
          on car.manufacturer_id = manufacturer.id
          inner join post
          on post.car_id = car.id
          where post.users_id =$1
          `,[id]);
        let userpost= result.rows
            res.json(userpost)
        })

    aboutRoute.get(`/userlikedpost/:id`, async (req, res) => {
        let id = +req.params.id
    
        if (!id) {
            res.status(400).json({
                error: 'Missing id in req.params'
            })
            return}
            let result = await client.query(`SELECT 
          car.id as car_id,
          post.id as post_id,
          manufacturer.manufacturer_name as manufacturer_name,
          car.model as model,
          car.price as price,
          car.image1 as car_image
          FROM car
          inner join manufacturer
          on car.manufacturer_id = manufacturer.id
          inner join post
          on post.car_id = car.id
          inner join like_posts
          on like_posts.post_id = post.id
          where like_posts.users_id=$1  
          `,[id]);
        let userlikedpost= result.rows
            res.json(userlikedpost)
        })