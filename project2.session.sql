select
    manufacturer_id,
    model,
    number_of_seats,
    engineer_volume,
    auto_transmission,
    year_of_manufacturing,
    price,
    discounted_price,
    image1,car_id, 
    users.id, 
    displayname, 
    phone from post 
join users on users.id = post.users_id
join car on car.id = post.car_id
where post.id = 2