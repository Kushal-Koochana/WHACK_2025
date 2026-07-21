const scenarios = [
    {
        text: "You just got a credit card offer with 24% APR. Do you accept?",
        yes: { feedback: "Accepting high APR can lead to expensive debt. Not the best move.", change: -20 },
        no: { feedback: "Good choice! Avoiding high interest rates protects your finances.", change: 10 }
    },
    {
        text: "You're short on cash this month. Do you skip your credit card payment?",
        yes: { feedback: "That choice might hurt your credit score. Missed payments stay for 7 years.", change: -50 },
        no: { feedback: "Nice job! Even minimum payments help protect your credit score.", change: 20 }
    },
    {
        text: "You’ve had a credit card for 5 years. Do you close the account to 'clean up' your credit?",
        yes: { feedback: "Closing old accounts can shorten credit history and hurt your score.", change: -15 },
        no: { feedback: "Keeping old accounts open strengthens your credit history.", change: 10 }
    },
    {
        text: "You max out your credit card but plan to pay it off slowly over a few months. Do you do it?",
        yes: { feedback: "High utilization can lower your credit score and raise interest charges.", change: -30 },
        no: { feedback: "Good move. Avoiding maxing out your card helps keep your credit healthy.", change: 15 }
    },
    {
        text: "You pay your credit card bill in full and on time every month. Keep it up?",
        yes: { feedback: "Excellent habit! On-time payments build strong credit history.", change: 25 },
        no: { feedback: "Missing payments can damage your score and lead to late fees.", change: -40 }
    },
    {
        text: "You decide to apply for five different credit cards in one week to 'build credit fast.' Do you go ahead?",
        yes: { feedback: "Too many hard inquiries in a short time can lower your score.", change: -35 },
        no: { feedback: "Smart decision. Space out credit applications to protect your score.", change: 10 }
    },
    {
        text: "A friend asks you to co-sign a loan. If they don’t pay, you’re responsible. Do you agree?",
        yes: { feedback: "Risky move. If they miss payments, it hurts YOUR credit too.", change: -25 },
        no: { feedback: "Smart! Protecting your credit from someone else’s debt is wise.", change: 15 }
    },
    {
        text: "You set up automatic payments for your credit card to never miss a due date. Do it?",
        yes: { feedback: "Great decision. Auto-pay helps avoid late fees and protects your score.", change: 20 },
        no: { feedback: "You might forget a payment and damage your credit.", change: -15 }
    },
    {
        text: "You only make the minimum payment on your credit card each month. Keep doing this?",
        yes: { feedback: "That can lead to more interest charges and higher debt over time.", change: -20 },
        no: { feedback: "Excellent! Paying more than the minimum saves money and improves credit.", change: 20 }
    },
    {
        text: "You check your credit report once a year for errors. Do it?",
        yes: { feedback: "Smart habit. Catching errors early can prevent credit damage.", change: 15 },
        no: { feedback: "Ignoring your credit report can let problems grow unnoticed.", change: -10 }
    },
    {
        text: "You take out a small personal loan and pay it off on time to diversify credit. Do it?",
        yes: { feedback: "Responsible installment loans can help your credit mix.", change: 15 },
        no: { feedback: "It's okay to avoid debt, but having a mix can boost your score slightly.", change: 0 }
    },
    {
        text: "You ignore a collection notice because it’s only $50. Do you skip paying?",
        yes: { feedback: "Even small collections can seriously damage your credit score.", change: -45 },
        no: { feedback: "Good! Paying collections quickly can minimize credit damage.", change: 20 }
    }
];

let currentScenario = 0;
let creditScore = 700;
let highScore = 700;
let isLoggedIn = false;

const scenarioTextEl = document.getElementById('scenarioText');
const feedbackEl = document.getElementById('feedback');
const creditScoreEl = document.getElementById('creditScore');
const highScoreEl = document.getElementById('highScore');
const nextBtn = document.getElementById('nextBtn');
const buttonsContainer = document.querySelector('.buttons');
const answerButtons = document.querySelectorAll('.buttons button');

let answered = false;

function clampScore(score) {
    return Math.max(300, Math.min(850, score));
}

async function loadHighScore() {
    try {
        const response = await fetch('/api/quiz/high');
        const data = await response.json();
        isLoggedIn = !!data.logged_in;
        if (isLoggedIn) {
            // 0 from the server always means "no scores recorded yet" (real
            // quiz scores are clamped to 300-850), so 700 is still the right
            // baseline default here - unlike the snake game, this isn't the
            // falsy-zero bug, just the normal "fresh account" case.
            highScore = data.high_score || 700;
        } else {
            // Guest: fall back to this browser's local copy.
            highScore = parseInt(localStorage.getItem('quizHighScore') || '700');
        }
        highScoreEl.innerText = highScore;
    } catch (e) {
        console.warn("Falling back to local storage.", e);
        isLoggedIn = false;
        highScore = parseInt(localStorage.getItem('quizHighScore') || '700');
        highScoreEl.innerText = highScore;
    }
}

async function saveScore(scoreValue) {
    try {
        await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: scoreValue })
        });
    } catch (e) {
        console.error("Local sync only.", e);
    }
}

function showScenario() {
    answered = false;
    scenarioTextEl.innerText = scenarios[currentScenario].text;
    feedbackEl.innerText = "";
    nextBtn.style.display = "none";
    nextBtn.innerText = "Next Scenario";
    buttonsContainer.style.display = "block";
    answerButtons.forEach(b => { b.disabled = false; });
}

function chooseAnswer(isYes) {
    if (answered) return;
    answered = true;

    const chosen = isYes ? scenarios[currentScenario].yes : scenarios[currentScenario].no;
    creditScore = clampScore(creditScore + chosen.change);
    creditScoreEl.innerText = creditScore;
    feedbackEl.innerText = chosen.feedback;
    nextBtn.style.display = "inline-block";

    answerButtons.forEach(b => { b.disabled = true; });
}

async function nextScenario() {
    currentScenario++;
    if (currentScenario < scenarios.length) {
        showScenario();
    } else {
        scenarioTextEl.innerText = "🎉 Game Over!";
        feedbackEl.innerText = `Final Score: ${creditScore}`;
        buttonsContainer.style.display = 'none';
        nextBtn.innerText = 'Play Again';
        nextBtn.style.display = 'inline-block';

        if (creditScore > highScore) {
            highScore = creditScore;
            highScoreEl.innerText = highScore;
            if (isLoggedIn) {
                // Persist per-user to the backend. Deliberately NOT written to
                // localStorage here, so a logged-in user's score can never
                // leak into another (guest) session sharing this browser.
                await saveScore(highScore);
            } else {
                // Guest: keep a local-only fallback.
                localStorage.setItem('quizHighScore', highScore);
            }
        }

        nextBtn.onclick = restartGame;
    }
}

function restartGame() {
    currentScenario = 0;
    creditScore = 700;
    creditScoreEl.innerText = creditScore;
    nextBtn.onclick = nextScenario;
    showScenario();
}

nextBtn.onclick = nextScenario;

loadHighScore();
showScenario();