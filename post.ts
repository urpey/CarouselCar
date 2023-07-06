import express, { query } from 'express'
import { client } from './db'
import { Request, Response } from 'express';
import { form } from './upload';
import { extractFile } from './upload';
// import { captureRejections } from 'events';
import formidable from 'formidable';
import "./session";
import { io } from './server';
import { Socket } from 'socket.io';
export let postRoute = express.Router()


export type postFrom = {
    type: number
    manufacturer_id: number;
    model: string;
    number_of_seats: number;
    engineer_volume: number;
    auto_transmission: boolean;
    year_of_manufacturing: number;
    price: number;
    discounted_price: number;
    contactname: boolean;
    contacttel: boolean;
}


postRoute.post('/sentpost', (req: Request, res: Response) => {
    let username = req.session.user?.username
    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                res.status(400).json({ err: 'no data in db' });
            }

            let postForm = fields
            if (!postForm) {
                res.status(400).json({ error: 'fields part error' })
                return
            }

            let file1 = extractFile(files.image1)
            let image1 = (file1 as formidable.File)?.newFilename

            let result = await client.query(`INSERT INTO car (
            type,
            manufacturer_id,
            model,
            number_of_seats,
            engineer_volume,
            auto_transmission,
            year_of_manufacturing,
            price,
            discounted_price,
            image1
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`, [
                postForm.type,
                postForm.manufacturer_id,
                postForm.model,
                postForm.number_of_seats.length ?? 0,
                postForm.engineer_volume.length > 0 ? postForm.engineer_volume : 0,
                postForm.auto_transmission,
                postForm.year_of_manufacturing,
                postForm.price.length > 0 ? postForm.price : 0,
                postForm.discounted_price.length > 0 ? postForm.discounted_price : 0,
                image1,
            ])

            let useridresult = await client.query(`select id from users where username = $1`, [username])
            let userId = useridresult.rows[0].id

            let carId = result.rows[0].id

            let file2 = extractFile(files.image2)
            if (!Array.isArray(file2)) {
                let image2 = (file2 as formidable.File)?.newFilename
                await client.query(`update car set image2=$1 where id=$2`, [image2, carId])
            } else {
                const images = (file2 as formidable.File[]).map(f => f?.newFilename);
                await client.query(`update car set image2=$1,
                image3=$2,
                image4=$3,
                image5=$4,
                image6=$5
                 where id=$6`, [
                    images[0] ? images[0] : "",
                    images[1] ? images[1] : "",
                    images[2] ? images[2] : "",
                    images[3] ? images[3] : "",
                    images[4] ? images[4] : "",
                    carId])
            }


            let postResult = await client.query(`INSERT INTO post (car_id,users_id) VALUES ($1,$2) returning id`, [carId, userId])
            let postId = postResult.rows[0].id
            await client.query(`INSERT INTO users_post (users_id,post_id) VALUES ($1,$2)`, [userId, postId])
            await client.query(`INSERT INTO users_car (users_id,car_id) VALUES ($1,$2)`, [userId, carId])
            res.redirect('readpost.html?id=' + postId)
        } catch (error) {
            res.status(500).json({ error: String(error) })
        }
    })

})

postRoute.get(`/post/:id`, async (req, res) => {
    let id = +req.params.id

    if (!id) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return
    }
    try {

        //select
        //     manufacturer_id,
        //     model,
        //     number_of_seats,
        //     engineer_volume,
        //     auto_transmission,
        //     year_of_manufacturing,
        //     price,
        //     discounted_price,
        //     image1,car_id, 
        //     users.id, 
        //     displayname, 
        //     phone from post 
        // join users on users.id = post.users_id
        // join car on car.id = post.car_id
        // where post.id = 2
        let userIdResult = await client.query(`select users_id from post where id = $1`, [id])
        let userId = userIdResult.rows[0].users_id
        let userResult = await client.query(`select id, displayname, phone from users where id = $1`, [userId])
        userResult = userResult.rows[0]


        let carResult = await client.query(`select car_id from post where id = $1`, [id])
        let carId = carResult.rows[0].car_id
        let result = await client.query(`select type,
            manufacturer_id,
            model,
            number_of_seats,
            engineer_volume,
            auto_transmission,
            year_of_manufacturing,
            price,
            discounted_price,
            image1,
            image2,
            image3,
            image4,
            image5,
            image6 from car where id = $1`, [carId])
        let jsonResult = result.rows[0]
        let manufacturer = await client.query(`select * from manufacturer where id = $1`, [result.rows[0].manufacturer_id]);
        manufacturer = manufacturer.rows[0].manufacturer_name
        // io.emit('postInfo', { jsonResult, manufacturer, userResult })
        res.json({ jsonResult, manufacturer, userResult })
    } catch (error) {
        res.status(500).json({ error: String(error) })
    }
})

postRoute.get('/userdata', async (req: Request, res: Response) => {
    let contactname = req.session.user?.username
    if (!contactname) {
        res.status(400).json({
            error: 'Missing username'
        })
        return
    }
    try {
        let result = await client.query(`select id, phone, displayname from users where username = $1`, [contactname]);

        let contacttel = result.rows[0].phone
        let userId = result.rows[0].id
        let displayname = result.rows[0].displayname

        res.json({ userId, contactname, contacttel, displayname })
    } catch (error) {
        res.status(500).json({ error: String(error) })
    }
})
// edit
postRoute.put(`/editpost/:id`, async (req, res) => {
    let postId = +req.params.id
    if (!postId) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return
    }

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                res.status(400).json({ err: 'no data in db' });
            }
            let editForm = fields
            if (!editForm) {
                res.status(400).json({ error: 'fields part error' })
                return
            }
            let carId = await client.query(`select car_id from post where id = $1 `, [postId])
            carId = carId.rows[0].car_id

            if (files.image1) {
                let file1 = extractFile(files.image1)
                let image1 = (file1 as formidable.File)?.newFilename
                await client.query(`update car set image1=$1 where id=$2`, [image1, carId])
            }
            if (files.image2) {
                let file2 = extractFile(files.image2)
                if (!Array.isArray(file2)) {
                    let image2 = (file2 as formidable.File)?.newFilename
                    await client.query(`update car set image2=$1 where id=$2`, [image2, carId])
                } else {
                    const images = (file2 as formidable.File[]).map(f => f?.newFilename);
                    await client.query(`update car set image2=$1,
        image3=$2,
        image4=$3,
        image5=$4,
        image6=$5
         where id=$6`, [
                        images[0] ? images[0] : "",
                        images[1] ? images[1] : "",
                        images[2] ? images[2] : "",
                        images[3] ? images[3] : "",
                        images[4] ? images[4] : "",
                        carId])
                }
            }

            await client.query(`update car set
            type=$1,
            manufacturer_id=$2,
            model=$3,
            number_of_seats=$4,
            engineer_volume=$5,
            auto_transmission=$6,
            year_of_manufacturing=$7,
            price=$8,
            discounted_price=$9 where id=$10
`, [editForm.type,
            editForm.manufacturer_id,
            editForm.model,
            editForm.number_of_seats.length > 0 ? editForm.number_of_seats : 0,
            editForm.engineer_volume.length > 0 ? editForm.engineer_volume : 0,
            editForm.auto_transmission,
            editForm.year_of_manufacturing,
            editForm.price.length > 0 ? editForm.price : 0,
            editForm.discounted_price.length > 0 ? editForm.discounted_price : 0,
                carId])
            await client.query(`update post set edited_at=now() where id=$1`, [postId])
            res.json('update success')
        } catch (error) {
            res.status(500).json({ error: String(error) })
        }
    })
})

postRoute.delete(`/editpost/:id`, async (req, res) => {
    let postId = +req.params.id
    if (!postId) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return
    }
    try {
        let carId = await client.query(`select car_id from post where id = $1 `, [postId])
        carId = carId.rows[0].car_id
        await client.query(`delete from users_post where post_id=$1`, [postId])
        await client.query(`delete from users_car where car_id=$1`, [carId])
        await client.query(`delete from post where id=$1`, [postId])
        await client.query(`delete from car where id=$1`, [carId])
        res.json('deleted')
    } catch (error) {
        res.status(500).json({ error: String(error) })
    }
})

postRoute.get('/manufacturer', (req, res) => {
    client.query("select * from manufacturer where manufacturer_name not like ('Other') order by id desc")
        .then(result => { return result.rows }).then(result => res.json({ result }))
})

postRoute.get(`/likenumber/:id`, async (req, res) => {
    let postId = +req.params.id
    if (!postId) {
        res.status(400).json({
            error: 'Missing id in req.params'
        })
        return
    }
    try {
        let result = await client.query(`select count(*) from like_posts where post_id=$1`, [postId])
        let votedNumber = result.rows[0].count
        res.json({ votedNumber })
    } catch (error) {
        res.status(500).json({ error: String(error) })
    }
})



