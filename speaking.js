/* =====================================================
   SPEAKING MODULE JAVASCRIPT
   Enhanced Audio Player, Transcripts, and Answer Toggles
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initCustomAudioPlayers();
    initTranscriptToggles();
    initSampleResponseToggles();
});

/* =====================================================
   CUSTOM AUDIO PLAYER
===================================================== */

function initCustomAudioPlayers() {
    const audioBoxes = document.querySelectorAll(".custom-audio-box");

    audioBoxes.forEach(box => {
        const audio = box.querySelector("audio");
        const playBtn = box.querySelector(".play-pause-btn");
        const playIcon = playBtn ? playBtn.querySelector("i") : null;
        const progressSlider = box.querySelector(".audio-slider");
        const currentTimeDisplay = box.querySelector(".current-time");
        const totalTimeDisplay = box.querySelector(".total-time");
        const volumeSlider = box.querySelector(".volume-slider");

        if (!audio) return;

        let isUserSeeking = false;

        function formatTime(seconds) {
            if (isNaN(seconds) || seconds === Infinity || !seconds) return "0:00";
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function updateDuration() {
            if (audio.duration && !isNaN(audio.duration)) {
                if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audio.duration);
                if (progressSlider) {
                    progressSlider.max = audio.duration;
                    progressSlider.step = 0.1;
                }
            }
        }

        // Check if metadata is already loaded
        if (audio.readyState >= 1) {
            updateDuration();
        }

        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("durationchange", updateDuration);
        audio.addEventListener("canplaythrough", updateDuration);

        audio.addEventListener("timeupdate", () => {
            if (!isUserSeeking) {
                if (currentTimeDisplay) {
                    currentTimeDisplay.textContent = formatTime(audio.currentTime);
                }
                if (progressSlider && audio.duration && !isNaN(audio.duration)) {
                    progressSlider.value = audio.currentTime;
                }
            }
        });

        audio.addEventListener("ended", () => {
            if (playIcon) playIcon.className = "fa-solid fa-play";
            if (progressSlider) progressSlider.value = 0;
            if (currentTimeDisplay) currentTimeDisplay.textContent = "0:00";
        });

        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (audio.paused) {
                    /* Pause other playing audio elements */
                    document.querySelectorAll("audio").forEach(otherAudio => {
                        if (otherAudio !== audio) {
                            otherAudio.pause();
                            const otherBox = otherAudio.closest(".custom-audio-box");
                            if (otherBox) {
                                const btnIcon = otherBox.querySelector(".play-pause-btn i");
                                if (btnIcon) btnIcon.className = "fa-solid fa-play";
                            }
                        }
                    });

                    audio.play().then(() => {
                        updateDuration();
                        if (playIcon) playIcon.className = "fa-solid fa-pause";
                    }).catch(err => {
                        console.error("Audio playback error:", err);
                    });
                } else {
                    audio.pause();
                    if (playIcon) playIcon.className = "fa-solid fa-play";
                }
            });
        }

        if (progressSlider) {
            progressSlider.addEventListener("mousedown", () => { isUserSeeking = true; });
            progressSlider.addEventListener("touchstart", () => { isUserSeeking = true; });

            progressSlider.addEventListener("input", () => {
                isUserSeeking = true;
                if (currentTimeDisplay) {
                    currentTimeDisplay.textContent = formatTime(progressSlider.value);
                }
            });

            progressSlider.addEventListener("change", () => {
                audio.currentTime = parseFloat(progressSlider.value);
                isUserSeeking = false;
            });

            progressSlider.addEventListener("mouseup", () => {
                audio.currentTime = parseFloat(progressSlider.value);
                isUserSeeking = false;
            });

            progressSlider.addEventListener("touchend", () => {
                audio.currentTime = parseFloat(progressSlider.value);
                isUserSeeking = false;
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener("input", () => {
                audio.volume = parseFloat(volumeSlider.value);
            });
        }
    });
}

/* =====================================================
   TRANSCRIPT TOGGLE
===================================================== */

function initTranscriptToggles() {
    const toggleBtns = document.querySelectorAll(".toggle-transcript-btn");

    toggleBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const panel = document.getElementById(targetId);

            if (panel) {
                const isOpen = panel.classList.contains("open");
                if (isOpen) {
                    panel.classList.remove("open");
                    this.innerHTML = `<i class="fa-regular fa-file-lines"></i> Read Transcript`;
                } else {
                    panel.classList.add("open");
                    this.innerHTML = `<i class="fa-solid fa-chevron-up"></i> Hide Transcript`;
                }
            }
        });
    });
}

/* =====================================================
   SAMPLE RESPONSE TOGGLE
===================================================== */

function initSampleResponseToggles() {
    const sampleBtns = document.querySelectorAll(".show-sample-btn");

    sampleBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const block = document.getElementById(targetId);

            if (block) {
                const isShowing = block.classList.contains("show");
                if (isShowing) {
                    block.classList.remove("show");
                    this.textContent = "Show Answer";
                    this.style.borderColor = "var(--border)";
                    this.style.color = "var(--text)";
                } else {
                    block.classList.add("show");
                    this.textContent = "Hide Answer";
                    this.style.borderColor = "var(--primary)";
                    this.style.color = "var(--primary)";
                }
            }
        });
    });
}
