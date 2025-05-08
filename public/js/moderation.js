// Функция для загрузки данных и обновления таблицы заявок
function loadRequests() {
    fetch('/api/checklist')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#requestsTable tbody');
            tbody.innerHTML = ''; // Очищаем таблицу

            data.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.name}</td>
                    <td>${request.phone}</td>
                    <td>${request.email}</td>
                    <td>${request.message}</td>
                    <td><button class="delete-btn" data-id="${request._id}">Удалить</button></td>`;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Ошибка при загрузке данных:', error));
}

// Функция для загрузки данных и обновления таблицы отзывов
function loadReviews() {
    fetch('/api/reviews')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#reviewsTable tbody');
            tbody.innerHTML = ''; // Очищаем таблицу

            data.forEach(review => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${review.name}</td>
                    <td>${review.email}</td>
                    <td>${review.message}</td>
                    <td>${review.status || 'На рассмотрении'}</td>
                    <td>
                        <select class="status-select" data-id="${review._id}">
                            <option value="approved">Одобрить</option>
                            <option value="rejected">Отклонить</option>
                        </select>
                        <button class="apply-btn" data-id="${review._id}">Применить</button>
                    </td>`;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Ошибка при загрузке отзывов:', error));
}

// Обработчик клика для кнопок удаления заявок
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('delete-btn')) {
        const requestId = event.target.getAttribute('data-id');
        deleteRequest(requestId);
    }
});

// Обработчик клика для кнопок применения статуса отзывов
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('apply-btn')) {
        const reviewId = event.target.getAttribute('data-id');
        const statusSelect = document.querySelector(`.status-select[data-id="${reviewId}"]`);
        const status = statusSelect.value;
        moderateReview(reviewId, status);
    }
});

// Функция для удаления заявки
function deleteRequest(requestId) {
    fetch(`/api/checklist/${requestId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadRequests(); // Перезагружаем таблицу после удаления
        } else {
            alert('Ошибка при удалении записи');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

function loadReviews() {
    fetch('/api/reviews')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(data => {
            console.log('Данные отзывов:', data); // Отладка
            const tbody = document.querySelector('#reviewsTable tbody');
            tbody.innerHTML = ''; // Очищаем таблицу

            data.forEach(review => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${review.name}</td>
                    <td>${review.email}</td>
                    <td>${review.message}</td>
                    <td>
                        <div class="action-buttons">
                            <select class="status-select" data-id="${review._id}">
                                <option value="approved">Одобрить</option>
                                <option value="rejected">Отклонить</option>
                            </select>
                            <button class="apply-btn" data-id="${review._id}">Применить</button>
                        </div>
                    </td>`;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке отзывов:', error);
            alert('Не удалось загрузить отзывы. Проверьте консоль для подробностей.');
        });
}

function moderateReview(reviewId, status) {
    fetch(`/api/moderate-review/${reviewId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadReviews(); // Перезагружаем таблицу после модерации
        } else {
            alert('Ошибка при обновлении статуса отзыва');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}


function deleteReview(reviewId) {
    fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadReviews(); // Перезагружаем таблицу после удаления
        } else {
            alert('Ошибка при удалении отзыва');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

// Загружаем данные при загрузке страницы
window.onload = function() {
    loadRequests();
    loadReviews();
};