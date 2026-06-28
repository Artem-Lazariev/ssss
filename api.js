let i = 1;

// Первая загрузка (1-я страница)
let data = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=0WWL1P2bMiHay23k871w1SovwR8BsLG9&countryCode=US&page=${i}`)
    .then(res => res.json())
    .catch(err => { console.error(err); });

export { data };

setInterval(async () => {
    if (document.querySelector("head").id == "1") {
        document.querySelector("head").id = "0";
        i++;
        console.log("Загружаю в конец страницу №: " + i);

        try {
            let response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=0WWL1P2bMiHay23k871w1SovwR8BsLG9&countryCode=US&page=${i}`)
                .then(res => res.json());

            // КЛЮЧЕВОЙ МОМЕНТ ДЛЯ ДОБАВЛЕНИЯ:
            // Берем новые события и пушим их в уже существующий массив data
            if (response["_embedded"] && response["_embedded"].events) {
                data["_embedded"].events.push(...response["_embedded"].events);
            }

            // Сигнализируем в gen.js
            document.querySelector("body").id = "need-render";

        } catch (err) {
            console.error("Ошибка при загрузке страницы " + i, err);
        }
    }
}, 1000);