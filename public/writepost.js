let postForm = document.querySelector('#postform')
let closeButton = document.querySelector('#close_button')
let image1 = document.querySelector('[name="image1"]')
let image2 = document.querySelector('[name="image2"]')
let preview1 = document.querySelector('[name="previewimage1"]')
let previewbtn = document.querySelector('#preview-btn')
let inputclasses = document.querySelectorAll('.inputclass')
let previewclasses = document.querySelectorAll('.previewclass')
let resetbtn = document.querySelector('#reset-btn')
let submitbtn = document.querySelector('#submit-btn')
let editbtn = document.querySelector('#edit-btn')
let ManuSelect = document.querySelector('select')
let optionTemplate = ManuSelect.querySelector('[value="999"]')
let modelInput = document.querySelector('#model')
let socket = io.connect();
let datalist = document.querySelector('datalist')
dataOption = datalist.querySelector('option')
let typeInput = document.querySelectorAll('[name="type"]')
let i = 0;


socket.on('connect', () => {
  console.log('socket.io connected to server, id:', socket.id)
})


image1.onchange = evt => {
  const [file] = image1.files
  if (file) {
    preview1.src = URL.createObjectURL(file)
  }
}

function readPreview(input){
  for (i = 0; i < input.files.length; i++) {
    let v= i+2;
    document.querySelector(`[name="previewimage${v}"]`).src=URL.createObjectURL(input.files[i])
  }

}

// image2.onchange = evt => {(input)=>{
//   if(input.files){
//     for (i = 0; i < input.files.length; i++) {
//       let reader = new FileReader();
//       reader.onload = event=>{
//         console.log(event.result);
//         document.querySelector(`[name="previewimage${v}"]`).src=event.result
//       }
//       reader.readAsDataURL(input.files[i]);
//     }
//   }

// }

// }




previewbtn.addEventListener('click', showPreview)

async function showPreview(event) {
  //event.preventDefault();
  const res = await CheckEmpty();
  if (res === false) return;
  //  type
  let typeId = document.querySelector('input[name="type"]:checked').value;
  console.log(typeId);


  document.querySelector(`[name="type-preview"]`).textContent = document.querySelector(`[for="${typeId}"]`).textContent
  //  manufacturer
  let manufacturer_id = document.querySelector('[name="manufacturer_id"] option:checked').value
  //document.querySelector('#manufacturer_id').value

  if (manufacturer_id == 999) {
    document.querySelector(`[name="manufacturer_id-preview"]`).textContent = "Other"
  } else {
    let manufacturerOptions = document.querySelectorAll('option')
    document.querySelector(`[name="manufacturer_id-preview"]`).textContent = manufacturerOptions[manufacturer_id - 1].textContent
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
  let result = ['model', 'number_of_seats', 'engineer_volume', 'year_of_manufacturing', 'price', 'image1']
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

// Show manufacturer Option
fetch('/manufacturer').then(res => { return res.json() }).then(json => { json.result.forEach(ShowOption) })
function ShowOption(json) {
  let OptionContainer = optionTemplate.cloneNode(true)
  OptionContainer.value = json.id
  OptionContainer.textContent = json.manufacturer_name
  ManuSelect.prepend(OptionContainer)
}

typeInput.forEach(type => type.addEventListener('input', () => {
  let typeId = document.querySelector('input[name="type"]:checked').value
  let manuId = document.querySelector('[name="manufacturer_id"] option:checked').value
  if (manuId) {
    socket.emit('Selected manufacturer', { typeId, manuId })
  }
}))



ManuSelect.addEventListener('input', () => {
  let typeId = document.querySelector('input[name="type"]:checked').value
  let manuId = document.querySelector('[name="manufacturer_id"] option:checked').value
  if (typeId) {
    socket.emit('Selected manufacturer', { typeId, manuId })
  }
})

modelInput.addEventListener('input', () => {
  let manuId = document.querySelector('[name="manufacturer_id"] option:checked').value
  let model = modelInput.value
  socket.emit('Inputting model', { manuId, model })
})


socket.on('modellist', (model) => {
  let dataOptions = datalist.querySelectorAll('option')
  dataOptions.forEach(data => data.remove())
  model.forEach(showInDatalist)
})

function showInDatalist(model) {
  let OptionContainer = dataOption.cloneNode(true)
  OptionContainer.textContent = model.model
  datalist.appendChild(OptionContainer)
}

socket.on('car detail', info => {
  AutoFillIn(info)
})
function AutoFillIn(info) {
  console.log(info);
  let transMissionInput = document.querySelectorAll('input[name="auto_transmission"]')
  if (info.auto_transmission) {
    transMissionInput[0].outerHTML = ` <input type="radio" name="auto_transmission" value="true" checked>`
  } else {
    transMissionInput[1].outerHTML = ` <input type="radio" name="auto_transmission" value="false" checked>`
  }
  document.querySelector('[name="price"]').placeholder = `市價$${info.price.toFixed(2)}`
  delete info.auto_transmission
  delete info.price
  for (let key in info) {
    document.querySelector(`[name="${key}"]`).value = info[key]
  }
}


fetch('/userdata').then((res) => { return res.json() }).then(json => {
  if (!json.userId) {
    alert('請先登入')
    window.location.replace('index.html')
  }
})

function toIndex() {
  window.location.replace('index.html')
}