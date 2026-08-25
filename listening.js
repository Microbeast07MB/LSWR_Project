const answers = {
    answer1: ["mkere"],
    answer2: ["westall"],
    answer3: ["bs8 9pu", "bs89pu"],
    answer4: ["0.75 m", "0.75m", "75 cm", "75cm"],
    answer5: ["0.5 m", "0.5m", "50 cm", "50cm"],
    answer6: ["books"],
    answer7: ["toys"],
    answer8: ["1700", "1,700"]
};


const submitBtn = document.getElementById("submitBtn");


function normalizeAnswer(answer) {

    return answer
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


submitBtn.addEventListener("click", function () {

    let score = 0;

    let unanswered = false;


    for (let id in answers) {

        const input = document.getElementById(id);

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


    /* Show result */

    showResult(score);

});


function showResult(score) {

    const total = 8;

    const percentage =
        Math.round((score / total) * 100);


    let message = "";


    if (percentage === 100) {

        message = "Excellent! Perfect score! 🎉";

    } else if (percentage >= 75) {

        message = "Great job! Your listening skills are strong.";

    } else if (percentage >= 50) {

        message = "Good effort! Keep practicing.";

    } else {

        message =
            "Keep practicing. Listening improves with regular practice.";

    }


    const formTask =
        document.querySelector(".form-task");


    formTask.innerHTML = `

        <div class="result-container">

            <div class="result-icon">
                🎧
            </div>

            <div class="skill-label">
                TASK 1 COMPLETE
            </div>

            <h1>Well Done!</h1>

            <p class="listening-description">
                You completed Questions 1–8.
            </p>


            <div class="score-circle">

                <span>${score}</span>

                <small>out of ${total}</small>

            </div>


            <h2>${percentage}% Accuracy</h2>


            <p class="result-message">

                ${message}

            </p>


            <button
                class="next-question-btn"
                id="nextTaskBtn"
            >

                Next Questions
                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;


    /* Hide old submit button */

    submitBtn.style.display = "none";


    /* Connect Next Questions button */

    document
        .getElementById("nextTaskBtn")
        .addEventListener("click", showTask2);

}

function showTask2() {

    /* Hide Task 1 */

    document.querySelector(".form-task")
        .style.display = "none";


    /* Hide Task 1 audio */

    const audioPlayer =
        document.getElementById("audioPlayer");


    if (audioPlayer) {

        audioPlayer.pause();

    }


    const firstAudioBox =
        document.getElementById("audioPlayer")
        .closest(".audio-box");


    if (firstAudioBox) {

        firstAudioBox.style.display = "none";

    }


    /* Show Task 2 */

    document.getElementById("task2")
        .style.display = "block";


    /* Move user to top */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


function restartTest() {

    location.reload();

}