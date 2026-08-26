/**
 * IELTS Writing Practice Module - Interactive Helper Script
 * Exclusively provides view toggling (Verbatim Candidate Script vs. Official PDF Viewer).
 * Strictly contains NO timers, NO countdowns, NO textareas, NO submissions, and NO localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Handle tab switching between Verbatim Script and Official PDF Document
    const tabButtons = document.querySelectorAll('.script-tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const parentSection = button.closest('.sample-answer-section');

            if (!parentSection || !targetId) return;

            // Remove active class from all sibling buttons in this section
            const siblingButtons = parentSection.querySelectorAll('.script-tab-btn');
            siblingButtons.forEach(btn => btn.classList.remove('active'));

            // Set active on clicked button
            button.classList.add('active');

            // Hide all tab panels in this section
            const tabPanels = parentSection.querySelectorAll('.script-tab-panel');
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });

            // Show target panel
            const targetPanel = parentSection.querySelector(`#${targetId}`);
            if (targetPanel) {
                targetPanel.style.display = 'block';
            }
        });
    });
});
