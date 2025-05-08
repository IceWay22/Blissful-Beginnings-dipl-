document.getElementById('reviewForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = document.getElementById('submitButton');

    fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.text())
    .then(message => {
        submitButton.value = 'Ваш отзыв принят';
        submitButton.disabled = true;
        form.reset();
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('message').textContent = 'Ошибка при отправке отзыва';
        document.getElementById('message').style.display = 'block';
    });
});