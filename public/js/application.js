document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    fetch('/submit-application', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.text())
    .then(message => {
        document.getElementById('popup').style.display = 'block';
        form.reset();
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Ошибка при отправке заявки');
    });
});

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
