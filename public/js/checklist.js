document.addEventListener('DOMContentLoaded', function () {
    const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const checkMissingButton = document.getElementById('checkMissingButton');
    const missingTasksModal = document.getElementById('missingTasksModal');
    const missingList = document.getElementById('missingList');
    const helpFormModal = document.getElementById('helpFormModal');
    const closeModals = document.querySelectorAll('.close-modal');
    const helpRequestForm = document.getElementById('helpRequestForm'); // Форма

    // Функция для обновления списка недостающих задач
    function updateMissingItems() {
        missingList.innerHTML = '';
        let hasMissingItems = false;

        checklistItems.forEach(item => {
            if (!item.checked) {
                const li = document.createElement('li');
                li.textContent = item.nextElementSibling.textContent;
                missingList.appendChild(li);
                hasMissingItems = true;
            }
        });

        // Показываем первое модальное окно с недостающими задачами
        if (hasMissingItems) {
            missingTasksModal.style.display = 'flex';
        } else {
            alert('Все задачи выполнены!');
        }
    }

    // Обработка нажатия на кнопку "Проверить, что осталось"
    checkMissingButton.addEventListener('click', updateMissingItems);

    // Закрытие первого модального окна и открытие второго
    document.getElementById('closeMissingTasksModal').addEventListener('click', function () {
        missingTasksModal.style.display = 'none';
        helpFormModal.style.display = 'flex'; // Открываем второе модальное окно
    });

    // Закрытие модальных окон при нажатии на крестик
    closeModals.forEach(closeButton => {
        closeButton.addEventListener('click', function () {
            missingTasksModal.style.display = 'none';
            helpFormModal.style.display = 'none';
        });
    });

    // Обработка отправки формы запроса на помощь
    helpRequestForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Предотвращаем стандартное поведение формы

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Отправляем данные на сервер
        fetch('/submit-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`
        })
        .then(response => response.text()) // Обрабатываем текстовый ответ
        .then(message => {
            alert(message); // Показываем сообщение от сервера
            helpRequestForm.reset(); // Очищаем форму
            document.getElementById('helpFormModal').style.display = 'none'; // Закрываем модальное окно
            location.reload(); // Перезагружаем страницу
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке запроса');
        });
    });
});