import express, { Request, Response, NextFunction } from 'express';
import "./session";
import { client } from "./db";
import { io } from './server';
let offset: number = 0;

export let homepageRoute = express.Router()

function checkLogInStatus(req: Request, res: Response, next: NextFunction) {
    if (req.session?.["user"]) {
        next();
        return;
    }
    else{
        res.json({ "hasLoggedIn": false, "username": null });
        return;
    }
}

homepageRoute.get('/index', checkLogInStatus, (req, res) => {
    res.json({ "hasLoggedIn": true, "username": req.session.user?.username });
})

homepageRoute.get('/cars/:currentPage/:nextPage', (req, res) => {
    const currentPage: number = +req.params.currentPage;
    const nextPage: number = +req.params.nextPage;
    drawCars(currentPage, nextPage).then(result => {
        console.log(result.result.length);
        res.json(result)});
});

homepageRoute.get('/type/:type/page/:currentPage/:nextPage', (req, res) => {
    const type: number = +req.params.type;
    const currentPage: number = +req.params.currentPage;
    const nextPage: number = +req.params.nextPage;
    selectedCars(type, currentPage, nextPage).then(result => res.json(result));
})

async function drawCars(currentPage: number, nextPage: number) {

    if (currentPage === nextPage) { offset = 0 }
    else if (currentPage < nextPage) { offset = (currentPage - 1) * 15 }
    else if (currentPage > nextPage) { offset = (currentPage - 1) * 15 };

    const count = await client.query(`select count(*) from car`);
    let result = await client.query(`SELECT 
    car.id as car_id,
    post.id as post_id,
    manufacturer.manufacturer_name as manufacturer_name,
    car.model as model,
    car.price as price,
    car.image1 as car_image1,
    car.image2 as car_image2,
    car.image3 as car_image3,
    car.image4 as car_image4,
    car.image5 as car_image5,
    car.image6 as car_image6
    FROM car
    inner join manufacturer
    on car.manufacturer_id = manufacturer.id
    inner join post
    on post.car_id = car.id
    where post.id is not null
    order by post.id desc
    limit 15 offset (${offset})`);
            
    console.log('current page: ' + currentPage + '   next page: ' + nextPage);
    console.log(count.rows[0].count);
    // console.log('result.rows: ' + +result.rows.length);
    
    if (Math.ceil((+count.rows[0].count) / 15) === currentPage)
        return { "result": result.rows, "firstPage": false, "lastPage": true };
    if (Math.ceil((+count.rows[0].count) / 15) === 1)
        return { "result": result.rows, "firstPage": true, "lastPage": false };

    return { "result": result.rows, "firstPage": false, "lastPage": false };  
};

async function selectedCars(type: number, currentPage: number, nextPage: number) {
    if (currentPage === nextPage) { offset = 0 }
    else if (currentPage < nextPage) { offset = (currentPage - 1) * 15 }
    else if (currentPage > nextPage) { offset = (currentPage - 1) * 15 };

    const count = await client.query(`select count(*) from car where car.type = (${type})`);
    let result = await client.query(`SELECT 
    car.id as car_id,
    post.id as post_id,
    manufacturer.manufacturer_name as manufacturer_name,
    car.model as model,
    car.price as price,
    car.image1 as car_image1,
    car.image2 as car_image2,
    car.image3 as car_image3,
    car.image4 as car_image4,
    car.image5 as car_image5,
    car.image6 as car_image6
    FROM car
    inner join manufacturer
    on car.manufacturer_id = manufacturer.id
    inner join post
    on post.car_id = car.id
    where post.id is not null and car.type = (${type})
    order by post.id desc
    limit 15 offset (${offset})`);

    console.log(count.rows[0].count)
    if (Math.ceil(+count.rows[0].count / 15) === currentPage)
        return { "result": result.rows, "firstPage": false, "lastPage": true };
    if (Math.ceil(+count.rows[0].count / 15) === 1)
        return { "result": result.rows, "firstPage": true, "lastPage": false };
    return { "result": result.rows, "firstPage": false, "lastPage": false };      
};