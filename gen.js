// Импортируем и данные, и функцию загрузки из api.js
import { data as dd, loadNextPage,filterr } from './api.js';
let data = dd;

if (typeof data !== "object") throw new Error("Data is not an object");
let cards = document.getElementById('cards');
let modal = document.getElementById('overlay');
let modalc = document.getElementById('modal-close');

modalc.addEventListener('click', e => {
    modal.style.display = 'none';
});

function getimg(array, type, count) {
    return array.filter((element) => {
        return element.ratio === type;
    })[count - 1];
}

async function getimgaw(array, count) {
    let errsrc = await fetch(getimg(array.images, "16_9", count).url).catch(err => err);
    return errsrc;
}

async function modaltext(array) {
    let text = modal.children[0].querySelectorAll("img, p");
    text[2].innerHTML = array.name;
    text[3].innerHTML = array.dates.start.localDate;
    text[4].innerHTML = array.dates.start.localTime + " local time";
    text[5].innerHTML = array["_embedded"]["venues"][0]["country"].name;
    text[6].innerHTML = array["_embedded"]["venues"][0]["city"].name;
    text[7].innerHTML = array.name;

    getimgaw(array, 2).then(rez => {
        if (!rez.massenge) {
            text[0].src = rez.url;
            text[1].src = rez.url;
        }
    });
}

const observer = new IntersectionObserver(async (entries, obs) => {
    entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
            let img = entry.target;
            obs.unobserve(img);

            const eventIndex = Number(img.classList[1].replace("img_", ""));
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
    rootMargin: '0px 0px 300px 0px'
});

cards.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    modal.style.display = 'flex';

    modaltext(data["_embedded"].events[Number(card.id.replace("card_", ""))]);
});

let counter = 0;

function gen() {
    const allEvents = data["_embedded"].events;

    // ВАЖНО: Стартуем цикл строго с counter (например, с 20-го элемента),
    // чтобы не перерисовывать старые карточки заново!
    for (let index = counter; index < allEvents.length; index++) {
        const i = allEvents[index]; // Текущий ивент

        const card = document.createElement('div');
        card.classList.add('card');
        card.id = "card_" + counter;
        cards.append(card);

        let img = document.createElement('img');
        img.classList.add('card-img');
        img.classList.add("img_"+counter);
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>";
        card.append(img);

        const title = document.createElement('p');
        title.classList.add('card-title');
        title.innerText = i.name;
        card.append(title);

        const content = document.createElement('p');
        content.classList.add('card-content');
        card.append(content);

        observer.observe(img);

        counter++; // Счетчик растет дальше (20, 21, 22...)
    }
}

// Первая отрисовка 1-й страницы при старте сайта
gen();

// НАСТОЯЩИЙ КЛИК ПО КНОПКЕ БЕЗ ТАЙМЕРОВ:
document.getElementById("btn").addEventListener("click", async () => {

    // 1. Вызываем функцию из api.js и ЖДЕМ (await), пока fetch докачает данные
    // и запушит их в общую коробку data.
    let success = await loadNextPage();

    // 2. Как только всё успешно скачалось — МГНОВЕННО запускаем отрисовку новых карточек
    if (success) {
        gen();
    }
});
document.getElementById("search").addEventListener("change", async () => {
    console.log("s")
    counter = 0;
    cards.innerHTML = "";
    let errorOrNot = await filterr("keyword",document.getElementById("search").value)
    let names = []
    let objects = []
    if (!errorOrNot.message){
        console.log(typeof errorOrNot["_embedded"]["events"])// object
        for (let i of errorOrNot["_embedded"]["events"]){
            if (!names.includes(i.name)){
                names.push(i.name)
                objects.push(i)
            }
        }
        console.log(objects)
        data = {"_embedded":{"events":objects}}
        gen() //render dont work why
    }
})
document.getElementById("search-country").addEventListener("change", async () => {
    console.log("c")
    counter = 0;
    cards.innerHTML = "";
    let errorOrNot = await filterr("country",document.getElementById("search").value);
    if (!errorOrNot.masenge){
        data = errorOrNot;
        gen();
    }


})