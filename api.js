let i = 1;

// Первая загрузка (1-я страница) при старте сайта
let data = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=0WWL1P2bMiHay23k871w1SovwR8BsLG9&countryCode=US&page=${i}`)
    .then(res => res.json())
    .catch(err => { console.error("Ошибка при первой загрузке:", err); });

// ЭКСПОРТ: отдаем наружу и объект с данными, и функцию загрузки
export { data, loadNextPage };

async function loadNextPage() {
    i++;
    console.log("Загружаю в конец страницу №: " + i);

    try {
        let response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=0WWL1P2bMiHay23k871w1SovwR8BsLG9&countryCode=US&page=${i}`)
            .then(res => res.json());

        if (response["_embedded"] && response["_embedded"].events) {
            // Твоя умная проверка на дубликаты (дедупликация) через .push()
            response["_embedded"].events.forEach(newEvent => {
                // Проверяем, нет ли уже такого ивента в нашей общей коробке data
                let isDuplicate = data["_embedded"].events.some(oldEvent => oldEvent.id === newEvent.id);

                if (!isDuplicate) {
                    data["_embedded"].events.push(newEvent);
                }
            });
        }

        // Возвращаем true, чтобы gen.js знал, что всё скачалось успешно и можно рисовать
        return true;

    } catch (err) {
        console.error("Ошибка при загрузке страницы " + i, err);
        return false;
    }
}