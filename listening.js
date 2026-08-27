/**
 * IELTS LISTENING PRACTICE ENGINE (Tasks 1 to 8)
 * Complete interactive testing suite with authentic Cambridge audio, Web Speech Synthesis player,
 * responsive map interactions, and official scoring analytics.
 */

// Global State
const taskScores = {
    task1: null,
    task2: null,
    task3: null,
    task4: null,
    task5: null,
    task6: null,
    task7: null,
    task8: null
};

let currentActiveTask = null;

// Official IELTS Answer Keys & Accepted Alternatives
const task1Answers = {
    answer1: ["mkere"],
    answer2: ["westall", "westall college"],
    answer3: ["bs8 9pu", "bs89pu", "bs8 9 pu"],
    answer4: [
        "0.75 m", "0.75m", "75 cm", "75cm", "0.75", "3/4 m", "3/4m",
        "0.75 metre", "0.75 metres", "0.75 meter", "0.75 meters",
        "three quarters of a metre", "three-quarters of a metre", "three quarter metre"
    ],
    answer5: [
        "0.5 m", "0.5m", "50 cm", "50cm", "0.5", "1/2 m", "1/2m",
        "0.5 metre", "0.5 metres", "0.5 meter", "0.5 meters",
        "half a metre", "half a meter", "half metre", "half meter"
    ],
    answer8: ["1700", "1,700", "£1700", "£1,700", "1700 pounds"]
};

// Task 1 Q6 & Q7 are in either order: books, toys
const task1PairAnswers = [
    ["books", "some books", "book"],
    ["toys", "some toys", "toy"]
];

const task2Answers = {
    question9: "C",
    question10: "A"
};

// Task 3: Q11 & Q12 (language, customs), Q13 & Q14 (music groups, local history groups), Q15 & Q16 (library, town hall)
const task3Pairs = {
    pair1: [["language"], ["customs"]],
    pair2: [
        ["music", "music groups", "music group"],
        ["local history", "local history groups", "local history group", "history"]
    ],
    pair3: [
        ["library", "libraries", "public library", "public libraries", "the library", "the public library"],
        ["town hall", "the town hall"]
    ]
};

// Task 4: Sentence Completion
const task4Answers = {
    answer27: ["motivation", "high motivation", "high level of motivation", "a high level of motivation"],
    answer28: ["time-management", "time management"],
    answer29: ["modules", "module"],
    answer30: ["summer schools", "summer school", "summer school(s)"]
};

// Task 5: Matching 1 (Courses)
const task5Answers = {
    answer21: "C", // Media Studies: Won't do it
    answer22: "A", // Women and Power: Definitely do it
    answer23: "B", // Culture and Society: May or may not
    answer24: "B", // Identity & Pop Culture: May or may not
    answer25: "C"  // Intro to Cultural Theory: Won't do it
};

// Task 6: Matching 2 (Hotels)
const task6Answers = {
    hotelAnswer1: "E", // rural area: The Royal Oak
    hotelAnswer2: "B", // only opened recently: Carlton House
    hotelAnswer3: "C", // facilities for business: The Imperial
    hotelAnswer4: "A"  // indoor pool: The Bridge Hotel
};

// Task 7: Plan Labelling (Library)
const task7Answers = {
    mapAnswer11: "H", // Room 11: Reference books
    mapAnswer12: "G", // Room 12: Periodicals
    mapAnswer13: "D", // 13: Local history collection
    mapAnswer14: "B", // Room 14: Children's books
    mapAnswer15: "F"  // Room 15: Multimedia
};

// Task 8: Notes & Table
const task8Answers = {
    nacAnswer11: ["classical music", "classical music concerts", "classical concerts", "concerts"],
    nacAnswer12: ["bookshop", "a bookshop", "book shop", "a book shop", "bookstore", "a bookstore"],
    nacAnswer13: ["planned"],
    nacAnswer14: ["1983", "the 1980s", "1980s", "the 80s", "the 1980's", "1980's"],
    nacAnswer15: ["city council", "the city council"],
    nacAnswer16: ["363", "363 days", "363 days per year"],
    nacAnswer17: ["garden hall", "the garden hall"],
    nacAnswer18: ["three lives", "'three lives'", '"three lives"'],
    nacAnswer19: ["4.50", "£4.50", "4.5", "£4.5", "4.50 pounds"],
    nacAnswer20: ["faces of china", "'faces of china'", '"faces of china"']
};

// Audio Transcripts for Synthetic Speech
const taskAudioTranscripts = {
    1: "You will hear a telephone conversation between a customer and an agent at a company which ships large boxes overseas. Good morning, Packham's Shipping Agents, can I help you? Oh yes, I'm ringing to make enquiries about sending a large box, a container, back home to Kenya from the UK. Yes, of course. Can I take your name? It's Jacob Mkere. That's M-K-E-R-E. Picked up from Westall College, Downlands Road in Bristol. Postcode BS8 9PU. The size is 1.5 metres long, 0.75 metres wide, and 0.5 metres deep. Contents are clothes, some books, and also some toys. Total estimated value is 1,700 pounds.",
    2: "Now obviously insurance is an important thing to consider. There are three rates: Premium rate for comprehensive cover, Standard rate, and Economy rate which only covers second hand value. I'll go for the highest, Premium rate. And for delivery, the port would be fine as I have transport at that end.",
    3: "Good evening and welcome to the British Council. My name is John Parker and I've been asked to talk to you briefly about certain aspects of life in the UK. When you are living in a foreign country, making social contacts can be difficult, not just because of the language, but because customs may be different. You can get involved in activities in your local community. For example, there are theatre groups, music groups, or local history groups. The best places to find information about community activities are either the public library or the town hall.",
    4: "Paul asked Rachel about studying with the Open University. Rachel explained that studying on your own demanded a great deal of motivation. Fitting studies around a full-time job improved her time-management skills. She found it helpful that the course was structured in modules, allowing students to take time off between them. Rachel also really enjoyed meeting fellow students at the annual summer schools.",
    5: "Jack is discussing optional courses with his tutor Dr Ray. For Media Studies, Jack decided he wants something completely new, so he won't do it. For Women and Power, taught by Dr Steed, Jack decides he will definitely do it. For Culture and Society, Jack says he will think about it, so he may or may not do it. For Identity and Popular Culture, Jack will wait to see who teaches it, so he may or may not do it. For Introduction to Cultural Theory, Dr Ray explains it repeats earlier material, so Jack decides he won't do it.",
    6: "At the tourist information office, the official describes five hotels. The Royal Oak is situated out in the country, about ten kilometres away in a rural area. Carlton House is a historic building that took its first guests just a few months ago, so it only opened recently. The Imperial is a modern hotel with meeting rooms, widely used for conferences and business functions. Finally, the only hotel with an indoor swimming pool is the Bridge Hotel.",
    7: "Chief librarian Ann introduces the town library floor plan. On your left opposite the librarian's desk is Room 11, the Reference Books room. Just beyond the desk on the right is Room 12, for Periodicals. In the main library area, on the far wall at location 13, you find the Local History collection. Past the seminar room, Room 14 is the Children's books section. To the right of the main library area, Room 15 houses the Multimedia collection.",
    8: "Dave Green presents the National Arts Centre. It is world-famous for classical music concerts. The complex houses concert rooms, theatres, cinemas, art galleries, a public library, restaurants, and a bookshop. The area was destroyed by bombs in 1940; the Centre was planned in the 60s, built in the 70s, and opened to the public in 1983. It is run by the City Council and open 363 days a year. Events include 'The Magic Flute' in the Garden Hall on Monday and Tuesday, the Canadian film 'Three Lives' on Wednesday in Cinema 2 for four pounds fifty, and the 'Faces of China' art exhibition in Gallery 1 on the weekend for free."
};

// Speech Synthesis State
let speechPlayerState = {
    isPlaying: false,
    taskId: null,
    rate: 1.0,
    interval: null,
    progress: 0,
    durationEstimate: 60
};

// =======================================================
// INITIALIZATION & URL ROUTING
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
    setupNativeAudioListeners();
    handleRouteFromUrl();

    // Listen to popstate for back/forward browser buttons
    window.addEventListener("popstate", handleRouteFromUrl);
});

function normalizeAnswer(text) {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/['"’“”]/g, "")
        .replace(/\s+/g, " ");
}

function handleRouteFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const taskParam = urlParams.get("task");

    if (taskParam && !isNaN(taskParam) && parseInt(taskParam) >= 1 && parseInt(taskParam) <= 8) {
        showTask(parseInt(taskParam));
    } else {
        showHub();
    }
}

function navigateToTask(taskNumber) {
    history.pushState({ task: taskNumber }, "", `listening.html?task=${taskNumber}`);
    showTask(taskNumber);
}

function navigateToHub() {
    history.pushState({}, "", `listening.html`);
    showHub();
}

function updateNavPills(activeId) {
    const pills = document.querySelectorAll(".listening-nav-pills a");
    pills.forEach(pill => {
        if (pill.id === activeId) {
            pill.classList.add("active");
            pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        } else {
            pill.classList.remove("active");
        }
    });
}

function showHub() {
    stopAllAudio();
    currentActiveTask = null;

    const hubSection = document.getElementById("listeningHubSection");
    const taskCard = document.getElementById("taskContentCard");
    const questionNumber = document.getElementById("questionNumber");
    const backBtnText = document.getElementById("backBtnText");
    const backBtn = document.getElementById("listeningBackBtn");

    if (hubSection) hubSection.style.display = "block";
    if (taskCard) taskCard.style.display = "none";
    if (questionNumber) questionNumber.textContent = "Practice Hub";
    if (backBtnText) backBtnText.textContent = "Back to Home";
    if (backBtn) backBtn.href = "index.html";

    updateNavPills("pill-hub");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showTask(taskNumber) {
    stopAllAudio();
    currentActiveTask = taskNumber;

    const hubSection = document.getElementById("listeningHubSection");
    const taskCard = document.getElementById("taskContentCard");
    const finalSummary = document.getElementById("finalSummary");
    const questionNumber = document.getElementById("questionNumber");
    const backBtnText = document.getElementById("backBtnText");
    const backBtn = document.getElementById("listeningBackBtn");

    if (hubSection) hubSection.style.display = "none";
    if (finalSummary) finalSummary.style.display = "none";
    if (taskCard) taskCard.style.display = "block";

    if (backBtnText) backBtnText.textContent = "Task Hub";
    if (backBtn) {
        backBtn.href = "#";
        backBtn.onclick = function (e) {
            e.preventDefault();
            navigateToHub();
        };
    }

    // Hide all task sections
    for (let i = 1; i <= 8; i++) {
        const sec = document.getElementById(`task${i}Section`);
        if (sec) sec.style.display = "none";
    }

    // Show selected task section
    const targetSection = document.getElementById(`task${taskNumber}Section`);
    if (targetSection) targetSection.style.display = "block";

    // Update Counter
    const taskTitles = [
        "Task 1 (Q1–8: Form)",
        "Task 2 (Q9–10: MCQs)",
        "Task 3 (Q11–16: Short Answer)",
        "Task 4 (Q27–30: Sentences)",
        "Task 5 (Q21–25: Matching 1)",
        "Task 6 (Q1–4: Matching 2)",
        "Task 7 (Q11–15: Plan Labelling)",
        "Task 8 (Q11–20: Note & Table)"
    ];
    if (questionNumber) questionNumber.textContent = taskTitles[taskNumber - 1] || `Task ${taskNumber} of 8`;

    updateNavPills(`pill-task${taskNumber}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// =======================================================
// AUDIO ENGINE (NATIVE MP3 + WEB SPEECH SYNTHESIS)
// =======================================================

function setupNativeAudioListeners() {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(taskId => {
        const audio = document.getElementById(`nativeAudio${taskId}`);
        if (!audio) return;

        audio.addEventListener("timeupdate", function () {
            const fill = document.getElementById(`progressFill${taskId}`);
            const curr = document.getElementById(`currTime${taskId}`);
            const dur = document.getElementById(`durTime${taskId}`);

            if (fill && audio.duration) {
                fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            }
            if (curr) curr.textContent = formatTime(audio.currentTime);
            if (dur && !isNaN(audio.duration)) dur.textContent = formatTime(audio.duration);
        });

        audio.addEventListener("ended", function () {
            const playBtn = document.getElementById(`playBtn${taskId}`);
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function toggleAudio(taskId) {
    const nativeAudio = document.getElementById(`nativeAudio${taskId}`);

    if (nativeAudio && nativeAudio.getAttribute("src")) {
        // Use native audio file
        if (nativeAudio.paused) {
            stopAllAudio();
            nativeAudio.play().then(() => {
                const btn = document.getElementById(`playBtn${taskId}`);
                if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }).catch(e => {
                console.warn("Audio play failed, falling back to speech:", e);
                playSpeech(taskId);
            });
        } else {
            nativeAudio.pause();
            const btn = document.getElementById(`playBtn${taskId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    } else {
        // Use Speech Synthesis
        if (speechPlayerState.isPlaying && speechPlayerState.taskId === taskId) {
            window.speechSynthesis.pause();
            speechPlayerState.isPlaying = false;
            clearInterval(speechPlayerState.interval);
            const btn = document.getElementById(`playBtn${taskId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else if (!speechPlayerState.isPlaying && speechPlayerState.taskId === taskId && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            speechPlayerState.isPlaying = true;
            startSpeechProgress(taskId);
            const btn = document.getElementById(`playBtn${taskId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            stopAllAudio();
            playSpeech(taskId);
        }
    }
}

function playSpeech(taskId) {
    if (!('speechSynthesis' in window)) {
        alert("Speech synthesis is not supported in this browser. Please read the tapescript.");
        return;
    }

    window.speechSynthesis.cancel();
    const text = taskAudioTranscripts[taskId] || "";
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = speechPlayerState.rate || 1.0;
    utterance.pitch = 1.0;

    // Pick British English voice if available
    const voices = window.speechSynthesis.getVoices();
    const gbVoice = voices.find(v => v.lang.includes("en-GB") || v.name.includes("UK") || v.name.includes("British") || v.lang.includes("en-US"));
    if (gbVoice) utterance.voice = gbVoice;

    speechPlayerState.taskId = taskId;
    speechPlayerState.isPlaying = true;
    speechPlayerState.progress = 0;
    speechPlayerState.durationEstimate = Math.max(25, text.split(" ").length / (2.5 * utterance.rate));

    const durElem = document.getElementById(`durTime${taskId}`);
    if (durElem) durElem.textContent = formatTime(speechPlayerState.durationEstimate);

    const playBtn = document.getElementById(`playBtn${taskId}`);
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    startSpeechProgress(taskId);

    utterance.onend = function () {
        speechPlayerState.isPlaying = false;
        clearInterval(speechPlayerState.interval);
        const fill = document.getElementById(`progressFill${taskId}`);
        if (fill) fill.style.width = '100%';
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    };

    utterance.onerror = function () {
        speechPlayerState.isPlaying = false;
        clearInterval(speechPlayerState.interval);
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    };

    window.speechSynthesis.speak(utterance);
}

function startSpeechProgress(taskId) {
    clearInterval(speechPlayerState.interval);
    const startSec = speechPlayerState.progress * speechPlayerState.durationEstimate / 100;
    let elapsed = startSec;

    speechPlayerState.interval = setInterval(() => {
        if (!speechPlayerState.isPlaying) return;
        elapsed += 0.5;
        const pct = Math.min(100, (elapsed / speechPlayerState.durationEstimate) * 100);
        speechPlayerState.progress = pct;

        const fill = document.getElementById(`progressFill${taskId}`);
        const curr = document.getElementById(`currTime${taskId}`);

        if (fill) fill.style.width = `${pct}%`;
        if (curr) curr.textContent = formatTime(elapsed);

        if (pct >= 100) {
            clearInterval(speechPlayerState.interval);
        }
    }, 500);
}

function seekAudio(event, taskId) {
    const bar = document.getElementById(`progressBar${taskId}`);
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));

    const nativeAudio = document.getElementById(`nativeAudio${taskId}`);
    if (nativeAudio && nativeAudio.getAttribute("src") && nativeAudio.duration) {
        nativeAudio.currentTime = pct * nativeAudio.duration;
    }
}

function cycleRate(taskId) {
    const rates = [1.0, 1.2, 0.8];
    const rateBtn = document.getElementById(`rateBtn${taskId}`);
    let currRate = speechPlayerState.rate || 1.0;

    let nextRate = rates[(rates.indexOf(currRate) + 1) % rates.length];
    speechPlayerState.rate = nextRate;

    if (rateBtn) rateBtn.textContent = `${nextRate}x`;

    const nativeAudio = document.getElementById(`nativeAudio${taskId}`);
    if (nativeAudio) nativeAudio.playbackRate = nextRate;

    if (speechPlayerState.isPlaying && speechPlayerState.taskId === taskId) {
        playSpeech(taskId);
    }
}

function stopAllAudio() {
    [1, 2].forEach(taskId => {
        const audio = document.getElementById(`nativeAudio${taskId}`);
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            const btn = document.getElementById(`playBtn${taskId}`);
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    speechPlayerState.isPlaying = false;
    clearInterval(speechPlayerState.interval);

    for (let i = 1; i <= 8; i++) {
        const btn = document.getElementById(`playBtn${i}`);
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function toggleTapescript(taskId) {
    const drawer = document.getElementById(`tapescript${taskId}`);
    const btnText = document.getElementById(`tsBtnText${taskId}`);

    if (drawer) {
        drawer.classList.toggle("open");
        const isOpen = drawer.classList.contains("open");
        if (btnText) btnText.textContent = isOpen ? "Hide Tapescript" : "View Tapescript";
    }
}


// =======================================================
// TASK EVALUATION & SCORING LOGIC
// =======================================================

function evaluateTask(taskNumber) {
    switch (taskNumber) {
        case 1: evaluateTask1(); break;
        case 2: evaluateTask2(); break;
        case 3: evaluateTask3(); break;
        case 4: evaluateTask4(); break;
        case 5: evaluateTask5(); break;
        case 6: evaluateTask6(); break;
        case 7: evaluateTask7(); break;
        case 8: evaluateTask8(); break;
    }
}

// TASK 1: Form Completion (8 marks)
function evaluateTask1() {
    let score = 0;
    let total = 8;
    let hasEmpty = false;

    // Evaluate Q1, Q2, Q3, Q4, Q5, Q8
    const singleIds = ["answer1", "answer2", "answer3", "answer4", "answer5", "answer8"];
    singleIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        const val = normalizeAnswer(input.value);
        if (!val) hasEmpty = true;

        const isCorrect = task1Answers[id].some(acc => normalizeAnswer(acc) === val);
        applyInputFeedback(input, isCorrect);
        if (isCorrect) score++;
    });

    // Evaluate Q6 & Q7 (books, toys in either order)
    const inp6 = document.getElementById("answer6");
    const inp7 = document.getElementById("answer7");
    if (inp6 && inp7) {
        const val6 = normalizeAnswer(inp6.value);
        const val7 = normalizeAnswer(inp7.value);
        if (!val6 || !val7) hasEmpty = true;

        const p1Correct6 = task1PairAnswers[0].some(a => normalizeAnswer(a) === val6);
        const p2Correct7 = task1PairAnswers[1].some(a => normalizeAnswer(a) === val7);

        const p2Correct6 = task1PairAnswers[1].some(a => normalizeAnswer(a) === val6);
        const p1Correct7 = task1PairAnswers[0].some(a => normalizeAnswer(a) === val7);

        if ((p1Correct6 && p2Correct7) || (p2Correct6 && p1Correct7)) {
            applyInputFeedback(inp6, true);
            applyInputFeedback(inp7, true);
            score += 2;
        } else if (p1Correct6 || p2Correct6) {
            applyInputFeedback(inp6, true);
            applyInputFeedback(inp7, false);
            score += 1;
        } else if (p1Correct7 || p2Correct7) {
            applyInputFeedback(inp6, false);
            applyInputFeedback(inp7, true);
            score += 1;
        } else {
            applyInputFeedback(inp6, false);
            applyInputFeedback(inp7, false);
        }
    }

    taskScores.task1 = { score, total };
    showTaskFeedbackBanner(1, score, total, hasEmpty);
}

// TASK 2: Multiple Choice (2 marks)
function evaluateTask2() {
    let score = 0;
    let total = 2;

    const q9 = document.querySelector('input[name="question9"]:checked');
    const q10 = document.querySelector('input[name="question10"]:checked');

    const group9 = document.getElementById("mcGroup9");
    const group10 = document.getElementById("mcGroup10");

    if (q9 && q9.value === task2Answers.question9) {
        score++;
        if (group9) group9.style.borderColor = "#22c55e";
    } else {
        if (group9) group9.style.borderColor = "#ef4444";
    }

    if (q10 && q10.value === task2Answers.question10) {
        score++;
        if (group10) group10.style.borderColor = "#22c55e";
    } else {
        if (group10) group10.style.borderColor = "#ef4444";
    }

    taskScores.task2 = { score, total };
    showTaskFeedbackBanner(2, score, total, (!q9 || !q10));
}

// TASK 3: Short-answer (6 marks)
function evaluateTask3() {
    let score = 0;
    let total = 6;
    let hasEmpty = false;

    // Pair 1: Q11 & Q12 (language, customs)
    score += checkPairInputs("answer11", "answer12", task3Pairs.pair1);

    // Pair 2: Q13 & Q14 (music, local history)
    score += checkPairInputs("answer13", "answer14", task3Pairs.pair2);

    // Pair 3: Q15 & Q16 (library, town hall)
    score += checkPairInputs("answer15", "answer16", task3Pairs.pair3);

    taskScores.task3 = { score, total };
    showTaskFeedbackBanner(3, score, total, hasEmpty);
}

function checkPairInputs(id1, id2, pairOptions) {
    const inp1 = document.getElementById(id1);
    const inp2 = document.getElementById(id2);
    if (!inp1 || !inp2) return 0;

    const val1 = normalizeAnswer(inp1.value);
    const val2 = normalizeAnswer(inp2.value);

    let pairScore = 0;
    const c1_1 = pairOptions[0].some(a => normalizeAnswer(a) === val1);
    const c2_2 = pairOptions[1].some(a => normalizeAnswer(a) === val2);

    const c2_1 = pairOptions[1].some(a => normalizeAnswer(a) === val1);
    const c1_2 = pairOptions[0].some(a => normalizeAnswer(a) === val2);

    if ((c1_1 && c2_2) || (c2_1 && c1_2)) {
        applyInputFeedback(inp1, true);
        applyInputFeedback(inp2, true);
        pairScore = 2;
    } else if (c1_1 || c2_1) {
        applyInputFeedback(inp1, true);
        applyInputFeedback(inp2, false);
        pairScore = 1;
    } else if (c1_2 || c2_2) {
        applyInputFeedback(inp1, false);
        applyInputFeedback(inp2, true);
        pairScore = 1;
    } else {
        applyInputFeedback(inp1, false);
        applyInputFeedback(inp2, false);
    }
    return pairScore;
}

// TASK 4: Sentence Completion (4 marks)
function evaluateTask4() {
    let score = 0;
    let total = 4;
    let hasEmpty = false;

    Object.keys(task4Answers).forEach(id => {
        const inp = document.getElementById(id);
        if (!inp) return;
        const val = normalizeAnswer(inp.value);
        if (!val) hasEmpty = true;

        const isCorrect = task4Answers[id].some(acc => normalizeAnswer(acc) === val);
        applyInputFeedback(inp, isCorrect);
        if (isCorrect) score++;
    });

    taskScores.task4 = { score, total };
    showTaskFeedbackBanner(4, score, total, hasEmpty);
}

// TASK 5: Matching 1 (5 marks)
function evaluateTask5() {
    let score = 0;
    let total = 5;
    let hasEmpty = false;

    Object.keys(task5Answers).forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        if (!select.value) hasEmpty = true;

        const isCorrect = select.value === task5Answers[id];
        applyInputFeedback(select, isCorrect);
        if (isCorrect) score++;
    });

    taskScores.task5 = { score, total };
    showTaskFeedbackBanner(5, score, total, hasEmpty);
}

// TASK 6: Matching 2 (4 marks)
function evaluateTask6() {
    let score = 0;
    let total = 4;
    let hasEmpty = false;

    Object.keys(task6Answers).forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        if (!select.value) hasEmpty = true;

        const isCorrect = select.value === task6Answers[id];
        applyInputFeedback(select, isCorrect);
        if (isCorrect) score++;
    });

    taskScores.task6 = { score, total };
    showTaskFeedbackBanner(6, score, total, hasEmpty);
}

// TASK 7: Plan Labelling (5 marks)
function evaluateTask7() {
    let score = 0;
    let total = 5;
    let hasEmpty = false;

    Object.keys(task7Answers).forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        if (!select.value) hasEmpty = true;

        const isCorrect = select.value === task7Answers[id];
        applyInputFeedback(select, isCorrect);
        if (isCorrect) score++;
    });

    taskScores.task7 = { score, total };
    showTaskFeedbackBanner(7, score, total, hasEmpty);
}

// TASK 8: Note & Table Completion (10 marks)
function evaluateTask8() {
    let score = 0;
    let total = 10;
    let hasEmpty = false;

    Object.keys(task8Answers).forEach(id => {
        const inp = document.getElementById(id);
        if (!inp) return;
        const val = normalizeAnswer(inp.value);
        if (!val) hasEmpty = true;

        const isCorrect = task8Answers[id].some(acc => normalizeAnswer(acc) === val);
        applyInputFeedback(inp, isCorrect);
        if (isCorrect) score++;
    });

    taskScores.task8 = { score, total };
    showTaskFeedbackBanner(8, score, total, hasEmpty);
}

function applyInputFeedback(element, isCorrect) {
    if (isCorrect) {
        element.classList.add("correct-answer");
        element.classList.remove("wrong-answer");
    } else {
        element.classList.add("wrong-answer");
        element.classList.remove("correct-answer");
    }
}

function showTaskFeedbackBanner(taskNumber, score, total, hasEmpty) {
    const pct = Math.round((score / total) * 100);
    let alertMsg = `Task ${taskNumber} Evaluated: ${score} / ${total} Correct (${pct}%).`;
    if (hasEmpty) {
        alertMsg += " (Note: Some questions were left blank).";
    }
    if (pct === 100) {
        alertMsg += " Excellent! Perfect accuracy! 🌟";
    }

    alert(alertMsg);
}


// =======================================================
// OVERALL SCORECARD & RESULTS SUMMARY
// =======================================================

function showOverallScorecard() {
    stopAllAudio();

    // Auto evaluate any tasks if not evaluated yet
    for (let i = 1; i <= 8; i++) {
        if (!taskScores[`task${i}`]) {
            evaluateTask(i);
        }
    }

    // Hide task views
    for (let i = 1; i <= 8; i++) {
        const sec = document.getElementById(`task${i}Section`);
        if (sec) sec.style.display = "none";
    }

    const taskCard = document.getElementById("taskContentCard");
    if (taskCard) taskCard.style.display = "block";

    let grandTotal = 0;
    let grandMax = 0;

    const taskNames = [
        "1. Form Completion (Q1–8)",
        "2. Multiple Choice (Q9–10)",
        "3. Short-answer Questions (Q11–16)",
        "4. Sentence Completion (Q27–30)",
        "5. Matching 1 - Courses (Q21–25)",
        "6. Matching 2 - Hotels (Q1–4)",
        "7. Plan Labelling - Library (Q11–15)",
        "8. Note & Table - Arts Centre (Q11–20)"
    ];

    let breakdownRows = "";

    for (let i = 1; i <= 8; i++) {
        const tScore = taskScores[`task${i}`] ? taskScores[`task${i}`].score : 0;
        const tTotal = taskScores[`task${i}`] ? taskScores[`task${i}`].total : 0;
        grandTotal += tScore;
        grandMax += tTotal;

        const rowPct = tTotal > 0 ? Math.round((tScore / tTotal) * 100) : 0;
        const badgeColor = rowPct >= 80 ? "#12b76a" : (rowPct >= 50 ? "#f79009" : "#f04438");

        breakdownRows += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <strong style="color: var(--dark); font-size: 14.5px;">${taskNames[i - 1]}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 700; color: var(--dark); font-size: 14.5px;">${tScore} / ${tTotal}</span>
                    <span style="background: ${badgeColor}22; color: ${badgeColor}; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 50px;">${rowPct}%</span>
                </div>
            </div>
        `;
    }

    const overallPct = grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0;

    // IELTS Estimated Band Score calculation
    let estimatedBand = "5.0";
    if (overallPct >= 90) estimatedBand = "8.5 – 9.0";
    else if (overallPct >= 80) estimatedBand = "7.5 – 8.0";
    else if (overallPct >= 70) estimatedBand = "7.0";
    else if (overallPct >= 60) estimatedBand = "6.5";
    else if (overallPct >= 50) estimatedBand = "6.0";
    else estimatedBand = "5.0 – 5.5";

    const finalSummary = document.getElementById("finalSummary");
    finalSummary.style.display = "block";
    finalSummary.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 56px; margin-bottom: 16px;">🏆</div>
            <div class="skill-label" style="margin-bottom: 15px;">IELTS LISTENING COMPLETE EVALUATION</div>
            <h1 style="font-size: 34px; font-family: 'Manrope', sans-serif; font-weight: 800; color: var(--dark); margin-bottom: 8px;">
                Your Overall Scorecard
            </h1>
            <p style="color: var(--muted); font-size: 15px; max-width: 580px; margin: 0 auto 30px auto;">
                Full performance report across all 8 authentic IELTS sample listening tasks.
            </p>

            <div class="score-metric-grid">
                <div class="score-metric-box">
                    <div class="score-metric-value">${grandTotal} / ${grandMax}</div>
                    <div class="score-metric-label">Total Questions Correct</div>
                </div>
                <div class="score-metric-box">
                    <div class="score-metric-value">${overallPct}%</div>
                    <div class="score-metric-label">Overall Accuracy</div>
                </div>
                <div class="score-metric-box">
                    <div class="score-metric-value" style="color: #12b76a;">Band ${estimatedBand}</div>
                    <div class="score-metric-label">Estimated IELTS Band</div>
                </div>
            </div>

            <div style="background: #ffffff; border: 1.5px solid var(--border); border-radius: 18px; overflow: hidden; margin: 30px auto; max-width: 620px; text-align: left; box-shadow: 0 4px 20px rgba(16, 24, 40, 0.04);">
                <div style="background: #f8fafc; padding: 14px 20px; border-bottom: 1.5px solid var(--border); font-weight: 800; font-size: 14px; color: var(--dark); text-transform: uppercase; letter-spacing: 0.5px;">
                    Task-by-Task Breakdown
                </div>
                ${breakdownRows}
            </div>

            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 35px;">
                <button type="button" onclick="navigateToHub()" class="task-nav-btn secondary">
                    <i class="fa-solid fa-grid-2"></i> Return to All Tasks
                </button>
                <button type="button" onclick="location.reload()" class="task-nav-btn secondary">
                    <i class="fa-solid fa-rotate-right"></i> Retake Full Practice
                </button>
                <a href="index.html" class="task-nav-btn primary">
                    <i class="fa-solid fa-house"></i> Home Dashboard
                </a>
            </div>
        </div>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
}