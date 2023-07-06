// let form3 =document.querySelector('.form3')
// const userDiv = document.querySelector('#userdiv')
let aboutBtn = document.querySelector('#about-btn')
const carList = document.querySelector('#post-container > a');
let params = new URLSearchParams(location.search)
let id = params.get('id')

carList.remove();

fetch('/userdata').then((res) => { return res.json() })
    .then(json => {

        if (!json.userId) {
            alert('請先登入')
            window.location.replace('index.html')
        }
        document.querySelector('.form3').classList.add('show')
        document.querySelector('#userdiv').textContent = json.displayname
    })

function ToAboutme() {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        let id = json.userId
        window.location.replace('/aboutuser.html?id=' + id)
    })
}

aboutBtn.addEventListener('click', event => {
    event.preventDefault()
    ToAboutme()
})



fetch(`/userlikedpost/` + id).then(res=>{return res.json()}).then(jsons=>{
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
    //node.querySelector('.price + div').textContent = 'post id: ' + car.post_id;
    document.querySelector('#post-container').prepend(node);
}
