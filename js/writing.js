/**
 * IELTS Writing Practice Module
 * Displays authentic candidate script images extracted directly from the official PDF.
 * Strictly contains NO timers, NO countdowns, NO textareas, NO submissions, and NO localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Optional smooth click-to-view in new tab for candidate script images
    const candidateImages = document.querySelectorAll('.candidate-script-img');
    candidateImages.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            window.open(img.src, '_blank');
        });
    });
});
