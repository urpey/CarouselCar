
let closeButton = document.querySelector('#close_button')
let image1 = document.querySelector('[name="image1"]')
let image2 = document.querySelector('[name="image2"]')

let preview1 = document.querySelector('[name="previewimage1"]')
let preview2 = document.querySelector('[name="previewimage2"]')

let previewbtn = document.querySelector('#preview-btn')
let inputclasses = document.querySelectorAll('.inputclass')
let previewclasses = document.querySelectorAll('.previewclass')
let resetbtn = document.querySelector('#reset-btn')
let submitbtn = document.querySelector('#submit-btn')
let editbtn = document.querySelector('#edit-btn')
let deletebtn = document.querySelector('#delete-btn')
let type = document.querySelector('[name="type"]')
let params = new URLSearchParams(location.search)
let id = params.get('id')
const image = document.querySelectorAll('.image');
const buttons = document.querySelectorAll('.image-container input');
let ManuSelect = document.querySelector('select')
let optionTemplate = ManuSelect.querySelector('[value="999"]')
let i=2;
// Reading part js

fetch('/post/' + id).then(res => {   return res.json() })
  .then(json => { showEditPost(json) })
  .catch(error => {
    console.error('failed to load json:', error)
  })

async function showEditPost(json) {
  postUserId = json.userResult.id
  let jsonResult = { ...json.jsonResult }
  showEditType(jsonResult.type)
  showEditTransmission(jsonResult.auto_transmission)

  for(let i = 1; i < 7; i ++) {
    showImage(i, jsonResult["image"+i])

  }
  
  // showImage(1, jsonResult.image1)
  // showImage(2, jsonResult.image2)
  // showImage(3, jsonResult.image3)
  // showImage(4, jsonResult.image4)
  // showImage(5, jsonResult.image5)
  // showImage(6, jsonResult.image6)

  delete jsonResult.type
  delete jsonResult.auto_transmission
  delete jsonResult.image1;
  delete jsonResult.image2;
  delete jsonResult.image3;
  delete jsonResult.image4;
  delete jsonResult.image5;
  delete jsonResult.image6;

  for (let key in jsonResult) {
    document.querySelector(`[name="${key}"]`).value = jsonResult[key]
  }

  await OwnerEdit(postUserId)


}

function showEditType(type) {
  let typeInput = document.querySelectorAll('[name="type"]')
  let typeIndex = type - 1
  typeInput[typeIndex].outerHTML = ` <input type="radio" name="type" value="${type}" checked>`
}

function showEditTransmission(transmission) {
  let transMissionInput = document.querySelectorAll('input[name="auto_transmission"]')
  if (transmission) {
    transMissionInput[0].outerHTML = ` <input type="radio" name="auto_transmission" value="true" checked>`
  } else {
    transMissionInput[1].outerHTML = ` <input type="radio" name="auto_transmission" value="false" checked>`
  }
}
// Writng part js

// image preview

image1.onchange = evt => {
  const [file] = image1.files
  if (file) {
    preview1.src = URL.createObjectURL(file)
  }
}

previewbtn.addEventListener('click', showPreview)

async function showPreview(event) {
  event.preventDefault();
  const res = await CheckEmpty();
  if (res === false) return;
   type
   
  let typeId = document.querySelector('input[name="type"]:checked').value;
  document.querySelector(`[name="type-preview"]`).textContent = document.querySelector(`[for="${typeId}"]`).textContent

  //  manufacturer
  let manufacturer_id = document.querySelector('[name="manufacturer_id"] option:checked').value
  if(manufacturer_id == 999){
    document.querySelector(`[name="manufacturer_id-preview"]`).textContent = "Other"
  }else {
    let manufacturerOptions = document.querySelectorAll('option')
    document.querySelector(`[name="manufacturer_id-preview"]`).textContent = manufacturerOptions[manufacturer_id-1].textContent
  }

  //  autotransmission
  let atValue = document.querySelector('input[name="auto_transmission"]:checked').value;
  document.querySelector(`[name="auto_transmission-preview"]`).textContent = document.querySelector(`[for="${atValue}"]`).textContent

  //todo contactname contactTel
  // other
  let result = ['model', 'number_of_seats', 'engineer_volume', 'year_of_manufacturing', 'price', 'discounted_price']
  for (let key of result) {

    document.querySelector(`[name="${key}-preview"]`).textContent = document.querySelector(`[name="${key}"]`).value
  }

  let imageset = ['image1', 'image2']
  for (let key of imageset) {
    let word = document.querySelector(`[name="${key}"]`).value
    word = word.slice(12)
    document.querySelector(`[name="${key}-preview"]`).textContent = word
  }

  for (let element of previewclasses) {
    element.classList.remove('hidden')
  }

  for (let element of inputclasses) {
    element.classList.add('hidden')
  }

  submitbtn.classList.remove('hidden')
  editbtn.classList.remove('hidden')

  previewbtn.classList.add('hidden')
  resetbtn.classList.add('hidden')
}

editbtn.addEventListener('click', showInput)
function showInput() {
  for (let element of inputclasses) {
    element.classList.remove('hidden')
  }
  for (let element of previewclasses) {
    element.classList.add('hidden')
  }
  submitbtn.classList.add('hidden')
  editbtn.classList.add('hidden')
  previewbtn.classList.remove('hidden')
  resetbtn.classList.remove('hidden')
}

async function CheckEmpty() {
  let result = ['model', 'number_of_seats', 'engineer_volume', 'year_of_manufacturing', 'price']

  for (let key of result) {
    let value = document.querySelector(`[name="${key}"]`).value
    if (value == '') {
      let content = document.querySelector(`[for="${key}"]`).textContent
      alert(`請填寫${content}。`)
      return false;
    }
  }

}
const input = document.querySelector('[name="image2"]');
input.addEventListener('change', (e) => {
  // Retrieve all files
  let files = input.files;

  // Check files count
  if (files.length > 5) {
    alert(`Only 5 files are allowed to upload.`);
    input.files = new DataTransfer().files
  }
  // TODO: continue uploading on server
});

fetch("/userdata").then((res) => {
  return res.json()
}).then(json => {
  
  let contactName = document.querySelector('[for="contactId"]')
  let previewName = document.querySelector('[name="contactId-preview"]')
  contactName.textContent = json.contactname
  previewName.textContent = json.contactname

  let contactTel = document.querySelector('[for="contactTel"]')
  let previewTel = document.querySelector('[name="contactTel-preview"]')
  contactTel.textContent = json.contacttel
  previewTel.textContent = json.contacttel

})


function OwnerEdit(postUserId) {
  fetch('/userdata').then((res) => { return res.json() }).then(json => {
    if (postUserId !== json.userId) {
      alert('You are not the owner of the post')
      window.location.replace('readpost.html?id=' + id)
    }
  })
}

submitbtn.addEventListener('click', async (event) => {
  event.preventDefault()
  const formData = new FormData();
  formData.append("type", document.querySelector('input[name="type"]:checked').value);
  formData.append("manufacturer_id", document.querySelector('[name="manufacturer_id"] option:checked').value);
  formData.append("model", document.querySelector('input[name="model"]').value);
  formData.append("number_of_seats", document.querySelector('input[name="number_of_seats"]').value);
  formData.append("engineer_volume", document.querySelector('input[name="engineer_volume"]').value);
  formData.append("auto_transmission", document.querySelector('input[name="auto_transmission"]:checked').value);
  formData.append("year_of_manufacturing", document.querySelector('input[name="year_of_manufacturing"]').value);
  formData.append("price", document.querySelector('input[name="price"]').value);
  formData.append("discounted_price", document.querySelector('input[name="discounted_price"]').value);
  formData.append("image1", document.querySelector('input[name="image1"]').files[0]);

  const files = document.querySelector('input[name="image2"]').files;
  for (let file of files) {
    formData.append(`image2`, file); // Ha
    i++
  }

  await fetch(`/editpost/${id}`, {
    method: 'PUT',
    body: formData
  }).then(res => res.json()).then(json => { window.location.replace('readpost.html?id=' + id) }).catch(err => ({ error: String(err) }))

})

deletebtn.addEventListener('click', event => {
  fetch('/editpost/' + id, { method: 'DELETE' })
    .then(res => res.json())
    .then(json => { window.location.replace('index.html') })
    .catch(err => ({ error: String(err) }))
})

buttons.forEach(button => {
  button.addEventListener('click', function(event) {
    let offset;

    if (event.target === document.querySelector('.next')) { offset = 1 }
    else { offset = -1 };
    const slides = button.closest('.image-container').querySelector(".images");

    const activeSlide = slides.querySelector("[data-active]");
    // console.log(activeSlide);
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;

    //newIndex < 0 && ( newIndex = slides.children.length - 1 );


    if (newIndex < 0) newIndex = slides.children.length - 1;
    if (newIndex >= slides.children.length) newIndex = 0;

    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;
    // console.log(newIndex);
  })
})
// Show manufacturer Option
fetch('/manufacturer').then(res=>{return res.json()}).then(json=>{json.result.forEach(ShowOption)})
function ShowOption(json){
  let OptionContainer = optionTemplate.cloneNode(true)
 OptionContainer.value = json.id
 OptionContainer.textContent = json.manufacturer_name
 ManuSelect.prepend(OptionContainer)
}

function showImage(index, image) {
  let img = document.querySelector(`[name="previewimage${index}"]`);
  img.src = '/uploads/' + image;
  if (!image) {
      img.src = './no-image.png'
  }
}

// show image preview after selecting new image in the edit post page

function toIndex(){

  window.location.replace('public/index.html')
}



function readPreview(input){
  for (i = 0; i < input.files.length; i++) {
    let v= i+2;
    console.log(input.files[i]);
    console.log(v);
    document.querySelector(`[name="previewimage${v}"]`).src=URL.createObjectURL(input.files[i])
  }

}