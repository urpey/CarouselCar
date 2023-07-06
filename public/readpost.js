
let image1 = document.querySelector('[name="image1"]')
let image2 = document.querySelector('[name="image2"]')

let preview1 = document.querySelector('[name="previewimage1"]')
let preview2 = document.querySelector('[name="previewimage2"]')

let type = document.querySelector('[name="type"]')
let editbtn = document.querySelector('#edit-btn')
let replySubmitbtn = document.querySelector('#reply-submit-btn')
let params = new URLSearchParams(location.search)
let id = params.get('id')
let replyContent = document.querySelector('[name="reply"]')
let replyUserName = document.querySelector('#replyUserName')
let replyArea = document.querySelector('.reply-area')
let replyTemplate = replyArea.querySelector('.reply-container')
let favrbtn = document.querySelector('#favr-btn')
let delfavrbtn = document.querySelector('#del-favr-btn')
let toABoutUser = document.querySelector('#toAboutUser')
let i = 1;
let socket = io.connect();

socket.on('connect', () => {
    console.log('socket.io connected to server, id:', socket.id)
})

fetch('/post/' + id).then(res => { return res.json() })
    .then(json => {
        if (json.error) {
            alert("此頁已被刪除或不存在")
            window.location.replace('index.html')
        }
     
        showPost(json); return json
    }).then(result => {

        fetch('/reply/' + id)
            .then(res => { return res.json() })
            .then(json => {
                if (json.replyResult.length >= 1) {
                    replyTemplate.remove()
                }
                json.replyResult.forEach(reply => showReply(reply, result))
            })

    })
    .catch(error => {
        console.error('failed to load json:', error)
    })

async function showPost(json) {
    let userResult = json.userResult;
    postUserId = json.userResult.id

    showOwnerElement(postUserId)
    document.querySelector(`[name="contactId"]`).textContent = userResult.displayname
    document.querySelector(`[name="contactTel"]`).textContent = userResult.phone
    toAboutUser.href = '/aboutuser.html?id=' + postUserId;

    let result = json.jsonResult;
        console.log(result)
    let type = switchtype(result.type);
    document.querySelector('[name="type"]').innerHTML = `${type}`
    showManufacturer(json.manufacturer)
    switchtransmission(result.auto_transmission);
    showPriceOrDiscount(result.price, result.discounted_price);

    showImage(1, result.image1);
    showImage(2, result.image2);
    showImage(3, result.image3);
    showImage(4, result.image4);
    showImage(5, result.image5);
    showImage(6, result.image6);

    loopShow(result);
}

function loopShow(result) {
    let newResult = ['engineer_volume', 'model', 'number_of_seats', 'engineer_volume', 'year_of_manufacturing'];

    for (let key of newResult) {
        document.querySelector(`[name="${key}"]`).innerHTML = result[key]
    }
}

function switchtype(type) {
    switch (type) {
        case 1: {
            return '私家車';

        }
        case 2: {
            return '客貨車';

        }
        case 3: {
            return '貨車';

        }
        case 4: {
            return '電單車';

        }
        case 5: {
            return '經典車';

        }

    }

}

function showManufacturer(name) {
    document.querySelector('[name="manufacturer"]').innerHTML = name;
}

function switchtransmission(boolean) {
    switch (boolean) {
        case true: {
            document.querySelector('[name="auto_transmission"]').innerHTML = '自動波';
            break;
        }
        case false: {
            document.querySelector('[name="auto_transmission"]').innerHTML = '棍波';
            break;
        }
    }
}

function showImage(index, image) {
    let img = document.querySelector(`[name="previewimage${index}"]`);
    img.src = '/uploads/' + image;
    if (!image) {
        img.src = './no-image.png'
    }
}

function showPriceOrDiscount(price, discount) {
    if (!discount || discount == 0) {
        document.querySelector('[name="price"]').textContent = price
    } else {
        document.querySelector('[name="price"]').innerHTML = `<strike>${price}</strike> <span style="color:Green">減價!</span>  <span style="color:red">$${discount}</span>`
    }
}

function showOwnerElement(postUserId) {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        if (postUserId == json.userId) {
            let ownerElement = document.querySelector('[name="ownerElement"]')
            ownerElement.classList.remove('hidden')
        }
    })
}



async function getReplyUserName() {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        replyUserName.textContent = json.displayname
    })
}

getReplyUserName()


// let userId;
// window.onload = async () =>{
//     fetch('/userdata').
//     then((res) => { return res.json() })
//     .then(json => {
//         userId = json.xxxx;
//     })
// }


replySubmitbtn.addEventListener('click', event => {
    event.preventDefault()

        
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        if (!json.userId) {
            alert('請先登入')
            window.location.replace('readpost.html?id=' + id)
            return
        }
        fetch(`/submitreply/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                users_id: json.userId,
                displayname: json.displayname,
                content: replyContent.value,
            })
        }).then(res => res.json()).then(json => { replyContent.value = ''; }).catch(err => ({ error: String(err) }))
    })

})

async function showReply(json, postInfo) {
    // console.log(json);
    // console.log(postInfo);
    let post = postInfo.jsonResult
    let replyContainer = replyTemplate.cloneNode(true)

    let replyUser = replyContainer.querySelector('.userName')
    replyUser.innerHTML = `${json.displayname}#${json.users_id}`
    let replyContent = replyContainer.querySelector('.replyContent')
    replyContent.textContent = json.content

    let userIdentity = replyContainer.querySelector('.userIdentity')
    if (json.users_id == postInfo.userResult.id) {
        userIdentity.textContent = '賣家'
    } else {
        userIdentity.textContent = "買家"
    }
    let postName = replyContainer.querySelector('.postName')
    let type = switchtype(post.type)

    if (post.discounted_price) {
        postName.innerHTML = `${type} ${post.model} ${post.year_of_manufacturing} 折售$${post.discounted_price} #${i}`
    } else {
        postName.innerHTML = `${type} ${post.model} ${post.year_of_manufacturing} 售價$${post.price} #${i}`
    }
    replyArea.appendChild(replyContainer)
    i++

}

// socket.io
socket.on('new reply', json => { if (replyTemplate) { replyTemplate.remove() }; showReply(json.json, json.postInfo) })

function toIndex() { window.location.replace('index.html') }
function ToEdit() { window.location.replace('/editpost.html?id=' + id) }

function AddFavouritePost() {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        if (!json.userId) {
            alert('請先登入')
            window.location.replace('readpost.html?id=' + id)
            return
        }
        let userId = json.userId
        let postId = id
        socket.emit('Favourite post', { userId, postId })
    })
    delfavrbtn.classList.remove('hidden')
    favrbtn.classList.add('hidden')
}

function DeleteFavouritePost() {
    fetch('/userdata').then((res) => { return res.json() }).then(json => {
        let userId = json.userId
        let postId = id
        socket.emit('Delete favourite post', { userId, postId })
    })
    delfavrbtn.classList.add('hidden')
    favrbtn.classList.remove('hidden')
}

socket.on('like Number', (json) => { document.querySelector('#votedNumber').textContent = json.votedNumber })

fetch('/likenumber/' + id).then(res => { return res.json() }).then(json => { document.querySelector('#votedNumber').textContent = json.votedNumber })

