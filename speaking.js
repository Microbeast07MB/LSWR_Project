/* =====================================================
   SPEAKING MODULE JAVASCRIPT
   Enhanced Audio Player, Transcripts, and Answer Toggles
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initCustomAudioPlayers();
    initTranscriptToggles();
    initSampleResponseToggles();
    initSpeakingCompletion();
});

async function initSpeakingCompletion() {
    const checks = [...document.querySelectorAll("[data-speaking-part]")];
    if (checks.length) {
        checks.forEach(check => check.addEventListener("click", event => event.stopPropagation()));
        const session = await window.supabaseAuth?.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await window.supabaseClient
            .from("speaking_completions")
            .select("part, completed")
            .eq("user_id", user.id);
        if (error) {
            console.error("Could not load Speaking checklist:", error.message);
            return;
        }

        const completed = new Set((data || []).filter(row => row.completed).map(row => Number(row.part)));
        checks.forEach(check => {
            check.checked = completed.has(Number(check.dataset.speakingPart));
            check.addEventListener("change", async () => {
                check.disabled = true;
                const { error: saveError } = await window.supabaseClient
                    .from("speaking_completions")
                    .upsert({
                        user_id: user.id,
                        part: Number(check.dataset.speakingPart),
                        completed: check.checked,
                        completed_at: check.checked ? new Date().toISOString() : null
                    }, { onConflict: "user_id,part" });
                check.disabled = false;
                if (saveError) {
                    check.checked = !check.checked;
                    console.error("Could not save Speaking checklist:", saveError.message);
                }
                updateSpeakingMockAvailability();
            });
        });
        updateSpeakingMockAvailability();
    }

    const startMock = document.getElementById("startSpeakingMock");
    if (startMock) startMock.addEventListener("click", startSpeakingMockTest);
}

function updateSpeakingMockAvailability() {
    const panel = document.getElementById("speakingTestPanel");
    if (!panel) return;
    panel.hidden = ![...document.querySelectorAll("[data-speaking-part]")].every(check => check.checked);
}

function startSpeakingMockTest() {
    const prompts = [
        { part: 1, label: "Part 1 — Introduction", seconds: 30, prompt: "Introduce yourself and describe where you live." },
        { part: 2, label: "Part 2 — Long turn", seconds: 60, prompt: "Describe a skill you learned that was useful to you. Say what it was, how you learned it, and why it was useful." },
        { part: 3, label: "Part 3 — Discussion", seconds: 30, prompt: "Why do people need to keep learning new skills throughout their lives?" }
    ];
    let promptIndex = 0;
    let remaining = prompts[0].seconds;
    const win = window.open("", "speakingMockTest", "width=720,height=640");
    if (!win) return;
    const render = () => {
        const item = prompts[promptIndex];
        win.document.body.innerHTML = `<main style="font:16px Arial,sans-serif;max-width:620px;margin:60px auto;padding:24px;color:#172033"><p style="color:#655bff;font-weight:bold">${item.label}</p><h1>Mock Speaking Test</h1><p>${item.prompt}</p><h2 id="timer">${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2,"0")}</h2><textarea placeholder="Optional notes (your speaking is not recorded)" style="width:100%;height:100px;padding:12px"></textarea><p id="status">Speak your answer aloud.</p><button id="next">${promptIndex === prompts.length - 1 ? "Finish test" : "Next part"}</button>`;
        win.document.getElementById("next").onclick = () => {
            if (promptIndex < prompts.length - 1) { promptIndex++; remaining = prompts[promptIndex].seconds; render(); }
            else {
                clearInterval(timer);
                saveSpeakingMockResult();
                win.document.body.innerHTML = "<main style='font:16px Arial,sans-serif;max-width:620px;margin:60px auto;padding:24px'><h1>Mock test complete</h1><p>Your Speaking practice has been added to your dashboard. You can review your answers and repeat any part you want to improve.</p><button onclick='window.close()'>Close</button></main>";
            }
        };
    };
    render();
    const timer = win.setInterval(() => {
        if (win.closed) { clearInterval(timer); return; }
        remaining = Math.max(0, remaining - 1);
        const node = win.document.getElementById("timer");
        if (node) node.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2,"0")}`;
        if (remaining === 0) win.document.getElementById("status").textContent = "Time is up. Continue when ready.";
    }, 1000);
}

async function saveSpeakingMockResult() {
    const session = await window.supabaseAuth?.getSession();
    if (!session?.user || !window.supabaseClient) return;
    const { error } = await window.supabaseClient.from("practice_results").insert({
        user_id: session.user.id,
        skill: "speaking",
        score: 3,
        max_score: 3
    });
    if (error) console.error("Could not save Speaking mock test:", error.message);
}

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
