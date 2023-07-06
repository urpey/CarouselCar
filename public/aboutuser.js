let params = new URLSearchParams(location.search)
let id = params.get('id')
let postCount = document.querySelector('#postCount')
let displayname = document.querySelector('#displayname')
let phone = document.querySelector('#phone')
const carList = document.querySelector('#post-container > a');

carList.remove();
document.querySelector('.form3').classList.add('show')

fetch(`/userinfo/` + id)
.then(res => {return res.json()})
.then(json=>{
    console.log(json);
    postCount.textContent =  json.postCount
    displayname.textContent = json.userinfo.displayname
    phone.textContent = json.userinfo.phone
})

fetch(`/userpost/` + id)
.then(res=>{return res.json()})
.then(jsons=>{
    console.log(jsons);
    jsons.forEach(prependNode)
})

function prependNode(car) {
    let node = carList.cloneNode(true);
    node.href = '/readpost.html?id=' + car.post_id;
    node.querySelector('.index-image').src = '/uploads/' + car.car_image;
    node.querySelector('.manufacturer').textContent = '品牌： ' + car.manufacturer_name;
    //node.querySelector('.manufacturer + div').textContent = 'car id: ' + car.car_id;
    node.querySelector('.model').textContent = '型號： ' + car.model;
    node.querySelector('.price').textContent = '價錢： $ ' + car.price;
   // node.querySelector('.price + div').textContent = 'post id: ' + car.post_id;
    document.querySelector('#post-container').prepend(node);
}

