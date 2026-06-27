import {data} from './api.js';//
if (typeof data !== "object") throw new Error("Data is not an object");
let cards = document.getElementById( 'cards')
let modal = document.getElementById( 'overlay' );
let modalc = document.getElementById( 'modal-close' );
modalc.addEventListener('click', e => {
    modal.style.display = 'none';
})


function getimg(array,type,count){

    return array.filter((element)=>{
        return element.ratio === type
    })[count - 1]
}
async function getimgaw(array,count){
    let errsrc = await fetch(getimg(array.images,"16_9",count).url).catch(err => err)
    return errsrc;
}
async function modaltext(array){
    let text = modal.children[0].children
    console.log(text)
    console.log(array)
    text[1].innerHTML = array.name
    getimgaw(array,2).then(rez=>{
        console.log(typeof rez)
        if(!rez.massenge){
            console.log(rez.url)
            text[0].src = rez.url
        }
    })
}
cards.addEventListener( 'click', e => {
    const card = e.target.closest( '.card' )
    if ( !card) return;
    modal.style.display = 'flex';

    modaltext(data["_embedded"].events[Number(card.id.replace("card_",""))]) //idk
})
for (let i of data["_embedded"].events) {
    const card = document.createElement('div');
    card.classList.add('card');

    card.id = "card_"+data["_embedded"].events.indexOf(i);
    cards.append(card);
    let img = document.createElement('img');
    img.classList.add('card-img');
    console.log(getimg(i.images, "16_9", 1).url)
    let imgsrc = await fetch(getimg(i.images, "16_9", 1).url).catch((err) => {
        img = document.createElement('p');
        img.classList.add('card-img-error');
        img.innerText = `Sorry we found error ${err.message}`;
    })
    console.log(imgsrc)
    img.src = imgsrc.url

    card.append(img);

    const title = document.createElement('p');
    title.classList.add('card-title');
    title.innerText = i.name;
    card.append(title);
    const content = document.createElement('p');
    content.classList.add('card-content');
    card.append(content);

}