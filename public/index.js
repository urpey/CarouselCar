// Coded by Zero
const popularList = document.querySelector('.popular');
const carList = document.querySelector('#post-container > a');
const userDiv = document.querySelector('#userdiv')

let defaultResult;
let currentPage = 1;
let nextPage = 1;

const carType = document.querySelectorAll('#type div');
const pagination = document.querySelectorAll('#pagination div');
let aboutBtn = document.querySelector('#about-btn')
let viewLikedPostBtn = document.querySelector('#viewlikedpost-btn')

let isFirstTime = true;
let lastPage = false;

carList.remove();

// to load the car info from the database
function loadCars(currentPage, nextPage) {
    fetch('/cars/' + currentPage + '/' + nextPage)
        .then(res => res.json())
        .then(json => {

            if (json.error) {
                console.error('error: ' + error);
                return;
            }

            defaultResult = json.result;
            for (let item of json.result) {
                appendNode(item);
            };

            console.log('current page: ' + currentPage);
            if (json.firstPage || currentPage === 1) document.querySelector('#prev').classList.add('hide')
            else document.querySelector('#prev').classList.remove('hide');
            
            if (json.lastPage || json.result.length === 0) {
                console.log('running this??')
                document.querySelector('#next').classList.add('hide')
            }
            else document.querySelector('#next').classList.remove('hide');

            // if(isFirstTime){
            //     document.querySelector('#prev').classList.add('hide');
            //     isFirstTime = false;
            // }
        })
        .catch(error => console.error('error: ' + error));
}

loadCars(currentPage, nextPage);

// car sorting
for (let type of carType) {
    type.addEventListener('click', function () {
        if (!type.classList.contains('chosen')) {

            for (let otherType of carType) {
                if (otherType.classList.contains('chosen')) { otherType.classList.toggle('chosen') };
            }
            console.log(type.id.substring(4))
            console.log(type.id)
            fetch('/type/' + type.id.substring(4) + '/page/' + currentPage + '/' + nextPage)
                .then(res => res.json())
                .then(json => {

                    if (json.error) {
                        console.error('error: ' + error);
                        return;
                    }

                    document.querySelector('#post-container').innerHTML = "";
                    json.result.forEach(car => {
                        appendNode(car);
                    })
                    
                    type.classList.toggle('chosen');

                    if (json.firstPage || currentPage === 1) document.querySelector('#prev').classList.add('hide')
                    else document.querySelector('#prev').classList.remove('hide');
                    if (json.lastPage || json.result.length === 0) document.querySelector('#next').classList.add('hide')
                    else document.querySelector('#next').classList.remove('hide');
                })
                .catch(error => console.error('error: ' + error));
        } 
        else {
            document.querySelector('#post-container').innerHTML = "";
            for (let item of defaultResult) {
                appendNode(item);
            }
            type.classList.toggle('chosen');
        }
    })
}

function appendNode(car) {
    let node = carList.cloneNode(true);
    node.href = '/readpost.html?id=' + car.post_id;
    node.querySelector('.index-image').src = '/uploads/' + car.car_image1;
    node.querySelector('.manufacturer').textContent = '品牌： ' + car.manufacturer_name;
    // node.querySelector('.manufacturer + div').textContent = 'car id: ' + car.car_id;
    node.querySelector('.model').textContent = '型號： ' + car.model;
    node.querySelector('.price').textContent = '價錢： $ ' + car.price;
    // node.querySelector('.price + div').textContent = 'post id: ' + car.post_id;
    document.querySelector('#post-container').appendChild(node);
}

// function showImage(image) {
//     let img = document.querySelector('.indexImage');
//     img.src = '/uploads/' + image;
//     if (!image) {
//         img.src = './no-image.png'
//     }
//   }

// pagination
for (let button of pagination) {
    button.addEventListener('click', function (event) {
        if (event.target.id === 'prev') {
            currentPage--;
            nextPage = currentPage - 1;
        }
        if (event.target.id === 'next') {
            currentPage++;
            nextPage = currentPage + 1;
        }
        document.querySelector('#post-container').innerHTML = "";
        loadCars(currentPage, nextPage);
    }
    )
};

// check login status
fetch('/index').then(res => res.json()).then(json => {
    if (json.hasLoggedIn) {
        document.querySelector(".form1").classList.add("hide");
        document.querySelector(".form2").classList.add("hide");
        document.querySelector(".form3").classList.add("show");
        userDiv.textContent = json.username;
    } 
})


// Coded by Joe


document.querySelector("#loginForm").addEventListener('submit', async (event) => {
    //async (event)=>{
    event.preventDefault();
    //}

    try{

        const form = event.target;
        const body = {
            username: form.username.value,
            password: form.password.value,
    
        }
        const res = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
        const result = await res.json();
        console.log(result)
        // result={success:true}
    
        if (result.success) {
            document.querySelector("div#user").innerHTML = result.msg;
            document.querySelector(".form1").classList.add("hide");
            document.querySelector(".form2").classList.add("hide");
            document.querySelector(".form3").classList.add("show");
            userDiv.textContent = result.username;
    
        } else {
            document.querySelector("div#user").innerHTML = result.msg;
        }
    }
    catch(err){
        document.querySelector("div#user").innerHTML = "Server error, please try again.";
    }
})


document.querySelector("#signUpForm").addEventListener('submit', async (event) => {
    //async (event)=>{
    event.preventDefault();
    //}
    const form = event.target;
    const body = {
        username: form.username.value,
        password: form.password.value,
        displayname: form.displayname.value,
        phone: form.phone.value,
    }
    const res = await fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)

    })
    const result = await res.json();
    if (result.success) {
        form.reset();
    }

    //result={success:true}
    document.querySelector("#user2").innerHTML = result.msg;
    // if (result.success) {
    // } else {
    //     document.querySelector("#user2").innerHTML = result.msg;
    // }
})

function TofavouritePost() {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        let id = json.userId
        window.location.replace('/favouritepost.html?id=' + id)
    })
}

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
viewLikedPostBtn.addEventListener('click', event => {
    event.preventDefault()
    TofavouritePost()
})