let quizzes = [],
  currentQuiz = null,
  currentQuestionIndex = 0,
  score = 0;

const app = document.getElementById("app");
const categories = document.getElementById("categoryPart");
const selectedCategory = document.querySelector(".selected-category");
const heroSection = document.getElementById("heroSection");
const list = document.querySelector(".category-list");
const quizSection = document.getElementById("quizSection");
const resultSection = document.getElementById("resultSection");

const quizTitle = document.getElementById("quizTitle");
const progressBar = document.getElementById("progressBar");
const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const answerContainer = document.getElementById("answerContainer");
const submitBtn = document.getElementById("submitBtn");
const errorMsg = document.getElementById("errorMsg");
const resultImage = document.getElementById("resultImage");
const scoreResult = document.getElementById("scoreResult");
const scoreTotal = document.getElementById("scoreTotal");

const classColors = ["orange", "green", "blue", "purple"];
const answersLetters = ["A", "B", "C", "D"];

// Theme Toggle
const darkToggle = document.getElementById("dark-toggle");
darkToggle.checked = localStorage.getItem("theme") === "dark";
document.body.classList.toggle("dark-mode", darkToggle.checked);

darkToggle.addEventListener("change", (e) => {
  const isDark = e.target.checked;
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Fetch and Load Quiz Data
fetch("./data.json")
  .then((res) => res.json())
  .then((data) => {
    quizzes = data.quizzes;
    showCategories();
  });

// Loading Categories
function showCategories() {
  quizzes.forEach((quiz, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `<img src="${quiz.icon}" alt="${quiz.title}" class="${classColors[index]}"><h3>${quiz.title}</h3>`;
    card.onclick = () => startQuiz(quiz, index);
    list.appendChild(card);
  });
}

let selected_category = "";
function startQuiz(quiz, index) {
  if (!quiz.questions || quiz.questions.length === 0) {
    alert(`No questions found in ${quiz.title} quiz. Please check the data.`);
    return;
  }
  currentQuiz = quiz;
  currentQuestionIndex = 0;
  score = 0;
  heroSection.classList.add("hidden");
  quizSection.classList.remove("hidden");
  selectedCategory.innerHTML = `<img src="${quiz.icon}" alt="${quiz.title}" class="${classColors[index]}"><h3>${quiz.title}</h3>`;
  selected_category = selectedCategory.innerHTML;
  loadQuestion();
}

// Shuffle Array Function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Load Question
let selectedAnswerBtn = null;
function loadQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];

  questionText.classList.add("fade");
  setTimeout(() => questionText.classList.remove("fade"), 500);

  questionText.textContent = question.question;
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${
    currentQuiz.questions.length
  }`;
  progressBar.style.width = `${
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
  }%`;

  submitBtn.textContent = "Submit Answer";
  errorMsg.classList.add("hidden");

  answerContainer.innerHTML = "";
  selectedAnswerBtn = null;

  // Shuffle options for randomness
  const shuffledOptions = shuffleArray(question.options);

  shuffledOptions.forEach((opt, index) => {
    const answerBtn = document.createElement("button");
    answerBtn.setAttribute("role", "button"); // For accessibility
    answerBtn.setAttribute("tabindex", "0"); // For accessibility

    answerBtn.className = "answer-btn";
    answerBtn.innerHTML = `<span class="answer-letter">${answersLetters[index]}</span>
                           <span class="answer-text"></span>
                           <img class="answer-icon" src="" alt=""></img>`;

    answerBtn.querySelector(".answer-text").textContent = opt;

    answerBtn.onclick = () => {
      [...answerContainer.children].forEach((btn) =>
        btn.classList.remove("selected")
      );
      answerBtn.classList.add("selected");
      selectedAnswerBtn = answerBtn;
      submitBtn.classList.remove("disabled");
      errorMsg.classList.add("hidden");
    };

    answerContainer.appendChild(answerBtn);
  });
}

// Submit Button Logic
submitBtn.onclick = () => {
  if (submitBtn.textContent === "Submit Answer") {
    if (!selectedAnswerBtn) {
      errorMsg.classList.remove("hidden");
      submitBtn.classList.add("disabled");
      return;
    }

    errorMsg.classList.add("hidden");
    submitBtn.classList.remove("disabled");

    const question = currentQuiz.questions[currentQuestionIndex];
    selectAnswer(selectedAnswerBtn, question.answer);

    // If last question, change to "Show Result"
    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
      submitBtn.textContent = "Show Result";
    } else if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      submitBtn.textContent = "Next Question";
    }
  } else if (
    submitBtn.textContent === "Next Question" ||
    submitBtn.textContent === "Show Result"
  ) {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }
};

function selectAnswer(btn, correct) {
  const isCorrect = btn.querySelector(".answer-text").textContent === correct;

  if (isCorrect) {
    btn.classList.add("correct");
    btn.querySelector(".answer-icon").src = "./assets/images/icon-correct.svg";
    score++;
  } else {
    btn.classList.add("wrong");
    btn.querySelector(".answer-icon").src =
      "./assets/images/icon-incorrect.svg";

    [...answerContainer.children].forEach((b) => {
      if (b.querySelector(".answer-text").textContent === correct) {
        b.querySelector(".answer-icon").src =
          "./assets/images/icon-correct.svg";
      }
    });
  }
}

function showResult() {
  quizSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  resultSection.querySelector(".selected-category").innerHTML =
    selected_category;
  scoreResult.textContent = `${score}`;
  scoreTotal.textContent = `out of ${currentQuiz.questions.length}`;

  // 🎉 Celebration if score is perfect
  if (score === currentQuiz.questions.length) {
    launchConfetti();
  }
}

function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 150,
    origin: { y: 0.6 },
  });
}
