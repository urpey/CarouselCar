import express, { query } from 'express'
import { client } from './db'
import { Request, Response } from 'express';
import "./session";
export let replyRoute = express.Router()
import { io } from './server'
import { Server } from 'http';

replyRoute.post(`/submitreply/:id`, async (req, res) => {
    // try{
    let userid = req.body.users_id;
    let displayname = req.body.displayname;
    let content = req.body.content;
    let replyId = await client.query(`INSERT INTO post_reply (post_id,
        users_id,
        displayname,
        content) VALUES ($1,$2,$3,$4) returning id`, [req.body.id, req.body.users_id, req.body.displayname, req.body.content])
    replyId = replyId.rows[0].id
    let postResult = await client.query(`select users_id,car_id from post where id=$1`, [req.body.id])
    let carId = postResult.rows[0].car_id
    let carInfo = await client.query(`select type, manufacturer_id, model, number_of_seats, engineer_volume, auto_transmission, year_of_manufacturing, price, discounted_price from car where id=$1`, [carId])
    let jsonResult = carInfo.rows[0]
    let manufacturerId = carInfo.rows[0].manufacturer_id

    let manufacturer = await client.query(`select manufacturer_name from manufacturer where id=$1`, [manufacturerId])
    manufacturer = manufacturer.rows[0].manufacturer_name

    let postUserId = postResult.rows[0].users_id
    let userResult = { 'id': postUserId }
    let postInfo = { jsonResult, manufacturer, userResult }
    let json = { replyId, 'users_id': userid, displayname, content }

    io.emit('new reply', { json, postInfo })
    res.json({ 'replyId': replyId })
    // } catch (error) {
    //     res.status(500).json({ error: String(error) })
    // }
})

replyRoute.get(`/reply/:id`, async (req, res) => {
    let postId = req.params.id
    if (!postId) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return
    }
    try {
        let reply = await client.query(`select id, users_id, displayname, content from post_reply where post_id = $1
    order by created_at`, [postId])
        let replyResult = reply.rows

        // console.log(replyResult);
        res.json({ replyResult })
    } catch (error) {
        res.status(500).json({ error: String(error) })
    }
})