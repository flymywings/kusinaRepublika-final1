const carousel = document.querySelector('.carousel');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');

let index = 0;

function updateCarousel() {
    const cardWidth = carousel.children[0].offsetWidth + 20; 
    carousel.style.transform = `translateX(${-cardWidth * index}px)`;
}

next.addEventListener('click', () => {
    index++;
    if (index > carousel.children.length - Math.floor(carousel.parentElement.offsetWidth / (carousel.children[0].offsetWidth + 20))) {
        index = 0; // reset to start
    }
    updateCarousel();
});

prev.addEventListener('click', () => {
    index--;
    if (index < 0) {
        index = carousel.children.length - Math.floor(carousel.parentElement.offsetWidth / (carousel.children[0].offsetWidth + 20));
    }
    updateCarousel();
});

window.addEventListener('resize', updateCarousel);

const testPrev = document.querySelector('.test-prev');
const testNext = document.querySelector('.test-next');
const testimonials = document.querySelector('.testimonials');
const testimonialCards = document.querySelectorAll('.testimonial-card');

let testIndex = 0;

function updateTestimonial() {
    testimonials.style.transform = `translateX(-${testIndex * 100}%)`;
}

testNext.addEventListener("click", () => {
    testIndex++;
    if (testIndex >= testimonialCards.length) testIndex = 0;
    updateTestimonial();
});

testPrev.addEventListener("click", () => {
    testIndex--;
    if (testIndex < 0) testIndex = testimonialCards.length - 1;
    updateTestimonial();
});