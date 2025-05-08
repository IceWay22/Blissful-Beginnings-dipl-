let currentSlide = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slide').length;

// Функция для перехода к следующему слайду
function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlidePosition();
}

// Функция для перехода к предыдущему слайду
function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlidePosition();
}

// Функция для обновления позиции слайдов
function updateSlidePosition() {
    const offset = -currentSlide * 100;
    slides.style.transform = `translateX(${offset}%)`;
}

// Автоматическая смена слайдов каждые 5 секунд
let slideInterval = setInterval(nextSlide, 5000);

// Обработчики для кнопок "предыдущий" и "следующий"
document.querySelector('.next').addEventListener('click', () => {
    clearInterval(slideInterval); // Остановить автоматическую смену
    nextSlide();
    slideInterval = setInterval(nextSlide, 5000); // Перезапустить интервал
});

document.querySelector('.prev').addEventListener('click', () => {
    clearInterval(slideInterval); // Остановить автоматическую смену
    prevSlide();
    slideInterval = setInterval(nextSlide, 5000); // Перезапустить интервал
});

// Показ первого слайда при загрузке страницы
updateSlidePosition();