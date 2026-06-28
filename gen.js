import { data as dd } from './api.js';

// Оставляем ссылку на объект. Когда api.js изменит внутренности data,
// мы увидим это и здесь, так как объекты передаются по ссылке.
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
    // ВАЖНО: Больше НЕ пишем cards.innerHTML = "" (не удаляем старое)
    // ВАЖНО: Больше НЕ сбрасываем counter = 0

    const allEvents = data["_embedded"].events;

    // Запускаем цикл только для НОВЫХ элементов, которые появились после counter
    for (let index = counter; index < allEvents.length; index++) {
        const i = allEvents[index]; // Текущий новый ивент

        const card = document.createElement('div');
        card.classList.add('card');
        card.id = "card_" + counter; // Уникальный ID (продолжает расти: 20, 21, 22...)
        cards.append(card);

        let img = document.createElement('img');
        img.classList.add('card-img');
        img.dataset.index = counter; // Индекс строго соответствует позиции в массиве data
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

        counter++; // Увеличиваем счетчик для следующей карточки
    }
}

// Первая отрисовка при старте страницы (отрисует первые 20 карточек)
gen();

// Клик по кнопке пагинации
document.getElementById("btn").addEventListener("click", () => {
    document.querySelector("head").id = "1";
});

// Интервал, который ждет команду на дорисовывание
setInterval(() => {
    let signal = document.querySelector("body").id;

    if (signal === "need-render") {
        console.log("Добавляю новые карточки в конец ленты...");

        // Вызываем gen(). Так как counter равен, например, 20,
        // функция проигнорирует первые 20 карточек и создаст только новые с 21 по 40.
        gen();

        // Сбрасываем сигнал
        document.querySelector("body").id = "";
    }
}, 1000);