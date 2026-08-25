let task1Score = 0;
let task2Score = 0;

const answers = {
    answer1: ["mkere"],
    answer2: ["westall", "westall college"],
    answer3: ["bs8 9pu", "bs89pu"],
    answer4: ["0.75 m", "0.75m", "75 cm", "75cm", "0.75"],
    answer5: ["0.5 m", "0.5m", "50 cm", "50cm", "0.5"],
    answer6: ["books", "book"],
    answer7: ["toys", "toy"],
    answer8: ["1700", "1,700"]
};

const task2Answers = {
    question9: "C",  // Premium
    question10: "A"  // Port
};

function normalizeAnswer(answer) {
    if (!answer) return "";
    return answer
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");
    const submitTask2 = document.getElementById("submitTask2");

    if (submitBtn) {
        submitBtn.addEventListener("click", handleTask1Submit);
    }

    if (submitTask2) {
        submitTask2.addEventListener("click", handleTask2Submit);
    }
});

function handleTask1Submit() {
    let score = 0;
    let unanswered = false;

    for (let id in answers) {
        const input = document.getElementById(id);
        if (!input) continue;

        const userAnswer = normalizeAnswer(input.value);

        /* Check if empty */
        if (userAnswer === "") {
            unanswered = true;
            input.classList.remove("correct-answer", "wrong-answer");
            continue;
        }

        /* Check answer */
        const correct = answers[id].some(function (answer) {
            return normalizeAnswer(answer) === userAnswer;
        });

        if (correct) {
            score++;
            input.classList.add("correct-answer");
            input.classList.remove("wrong-answer");
        } else {
            input.classList.add("wrong-answer");
            input.classList.remove("correct-answer");
        }
    }

    /* If some answers are empty */
    if (unanswered) {
        alert("Please answer all questions before submitting.");
        return;
    }

    task1Score = score;
    showTask1Result(score);
}

function showTask1Result(score) {
    const total = 8;
    const percentage = Math.round((score / total) * 100);

    let message = "";
    if (percentage === 100) {
        message = "Excellent! Perfect score on Task 1! 🎉";
    } else if (percentage >= 75) {
        message = "Great job! Your listening skills are strong.";
    } else if (percentage >= 50) {
        message = "Good effort! Keep practicing.";
    } else {
        message = "Keep practicing. Listening improves with regular practice.";
    }

    const task1Container = document.getElementById("task1");

    task1Container.innerHTML = `
        <div class="result-container" style="text-align: center; padding: 20px 0;">
            <div class="result-icon" style="font-size: 48px; margin-bottom: 15px;">
                🎧
            </div>
            <div class="skill-label" style="margin-bottom: 15px;">
                TASK 1 COMPLETE
            </div>
            <h2 style="font-size: 28px; margin-bottom: 10px;">Well Done!</h2>
            <p class="listening-description" style="margin-bottom: 20px;">
                You completed Questions 1–8.
            </p>

            <div class="score-circle" style="font-size: 32px; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
                ${score} / ${total} Correct
            </div>

            <h3 style="font-size: 22px; margin-bottom: 15px; color: var(--dark);">${percentage}% Accuracy</h3>

            <p class="result-message" style="color: var(--text); margin-bottom: 30px;">
                ${message}
            </p>

            <button class="next-question-btn" id="nextTaskBtn">
                Continue to Task 2 (Questions 9–10)
                <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
            </button>
        </div>
    `;

    document
        .getElementById("nextTaskBtn")
        .addEventListener("click", showTask2);
}

function showTask2() {
    /* Hide Task 1 */
    const task1 = document.getElementById("task1");
    if (task1) task1.style.display = "none";

    /* Pause Task 1 audio */
    const audioPlayer = document.getElementById("audioPlayer");
    if (audioPlayer) {
        audioPlayer.pause();
    }

    const audioBoxTask1 = document.getElementById("audioBoxTask1");
    if (audioBoxTask1) {
        audioBoxTask1.style.display = "none";
    }

    /* Update page title & counter */
    const questionNumber = document.getElementById("questionNumber");
    if (questionNumber) {
        questionNumber.textContent = "Task 2 of 2 (Questions 9–10)";
    }

    /* Show Task 2 */
    const task2 = document.getElementById("task2");
    if (task2) {
        task2.style.display = "block";
    }

    /* Scroll smoothly to top */
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function handleTask2Submit() {
    const q9Selected = document.querySelector('input[name="question9"]:checked');
    const q10Selected = document.querySelector('input[name="question10"]:checked');

    if (!q9Selected || !q10Selected) {
        alert("Please answer both Questions 9 and 10 before submitting.");
        return;
    }

    let score = 0;
    if (q9Selected.value === task2Answers.question9) {
        score++;
    }
    if (q10Selected.value === task2Answers.question10) {
        score++;
    }

    task2Score = score;
    showFinalResults();
}

function showFinalResults() {
    /* Hide Task 2 */
    const task2 = document.getElementById("task2");
    if (task2) task2.style.display = "none";

    /* Pause Task 2 audio */
    const audioPlayer2 = document.getElementById("audioPlayer2");
    if (audioPlayer2) {
        audioPlayer2.pause();
    }

    /* Update Navbar counter */
    const questionNumber = document.getElementById("questionNumber");
    if (questionNumber) {
        questionNumber.textContent = "Test Completed";
    }

    /* Hide top page title & desc */
    const pageTitle = document.getElementById("pageTitle");
    const pageDesc = document.getElementById("pageDesc");
    if (pageTitle) pageTitle.style.display = "none";
    if (pageDesc) pageDesc.style.display = "none";

    const totalScore = task1Score + task2Score;
    const totalQuestions = 10;
    const percentage = Math.round((totalScore / totalQuestions) * 100);

    let message = "";
    if (percentage >= 90) {
        message = "Outstanding performance! You achieved an IELTS Band 8.0+ equivalent score.";
    } else if (percentage >= 70) {
        message = "Great effort! You demonstrate strong English comprehension skills.";
    } else if (percentage >= 50) {
        message = "Good attempt! Regular listening practice will boost your score further.";
    } else {
        message = "Keep practicing! Consistent daily listening practice leads to rapid progress.";
    }

    const finalSummary = document.getElementById("finalSummary");
    finalSummary.style.display = "block";
    finalSummary.innerHTML = `
        <div class="result-container" style="text-align: center; padding: 20px 0;">
            <div class="result-icon" style="font-size: 56px; margin-bottom: 20px;">
                🏆
            </div>

            <div class="skill-label" style="margin-bottom: 15px;">
                LISTENING TEST COMPLETED
            </div>

            <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 10px;">Full Test Score</h1>

            <p class="listening-description" style="margin-bottom: 25px;">
                Here is your complete evaluation for Packham's Shipping Agents Test.
            </p>

            <div class="score-circle" style="font-size: 42px; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
                ${totalScore} / ${totalQuestions}
            </div>

            <h2 style="font-size: 26px; margin-bottom: 15px; color: var(--dark);">${percentage}% Overall Accuracy</h2>

            <div style="max-width: 400px; margin: 0 auto 30px auto; background: #f8f7ff; padding: 20px; border-radius: 16px; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 600;">
                    <span>Task 1 (Form Completion):</span>
                    <span>${task1Score} / 8</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                    <span>Task 2 (Multiple Choice):</span>
                    <span>${task2Score} / 2</span>
                </div>
            </div>

            <p class="result-message" style="color: var(--text); font-size: 16px; margin-bottom: 35px; line-height: 1.6;">
                ${message}
            </p>

            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                <button onclick="restartTest()" class="secondary-btn" style="padding: 14px 24px; cursor: pointer;">
                    <i class="fa-solid fa-rotate-right" style="margin-right: 8px;"></i>
                    Retake Practice
                </button>

                <a href="index.html" class="primary-btn" style="padding: 14px 28px; text-decoration: none;">
                    <i class="fa-solid fa-house" style="margin-right: 8px;"></i>
                    Back to Home
                </a>
            </div>
        </div>
    `;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function restartTest() {
    location.reload();
}