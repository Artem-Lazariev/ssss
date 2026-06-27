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
    console.log(JSON.stringify(array, null, 2));
    let text = modal.children[0].querySelectorAll("img, p");
    console.log(array)
    text[2].innerHTML = array.name
    text[3].innerHTML = array.dates.start.localDate
    text[4].innerHTML = array.dates.start.localTime + " local time"
    getimgaw(array,2).then(rez=>{
        console.log(typeof rez)
        if(!rez.massenge){
            console.log(rez.url)
            text[0].src = rez.url
            text[1].src = rez.url
        }
    })
}
// Передаем настройки вторым аргументом после функции
const observer = new IntersectionObserver(async (entries, obs) => {
    entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
            let img = entry.target;
            obs.unobserve(img);

            const eventIndex = img.dataset.index;
            const currentEvent = data["_embedded"].events[eventIndex];

            try {
                const imgUrl = getimg(currentEvent.images, "16_9", 1).url;

                img.onload = () => {
                    img.classList.remove('card-img-loading');
                };

                img.src = imgUrl;
                img.loading = 'lazy';

            } catch (err) {
                const errorParagraph = document.createElement('p');
                errorParagraph.classList.add('card-img-error');
                errorParagraph.innerText = `Error`;
                img.replaceWith(errorParagraph);
            }
        }
    });
}, {
    // ВОТ ЭТОТ КУСОК ОТВЕЧАЕТ ЗА ПРЕДЗАГРУЗКУ:
    rootMargin: '0px 0px 300px 0px'
});
cards.addEventListener( 'click', e => {
    const card = e.target.closest( '.card' )
    if ( !card) return;
    modal.style.display = 'flex';

    modaltext(data["_embedded"].events[Number(card.id.replace("card_",""))]) //idk
})
let counter = 0;

for (let i of data["_embedded"].events) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = "card_" + counter;
    cards.append(card);

    let img = document.createElement('img');
    img.classList.add('card-img');

    // Передаем индекс текущего ивента в dataset картинки
    img.dataset.index = counter;

    // Ставим прозрачную заглушку
    img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>";

    card.append(img);

    // Дальше твой код создания title, content и т.д.
    const title = document.createElement('p');
    title.classList.add('card-title');
    title.innerText = i.name;
    card.append(title);

    const content = document.createElement('p');
    content.classList.add('card-content');
    card.append(content);

    // Включаем сторожа для картинки
    observer.observe(img);

    counter++;
}