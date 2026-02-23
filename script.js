// ============================
// VARIÁVEIS GLOBAIS
// ============================

let questions = []; // será carregado do JSON local
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = [];
let playerName = "";

// ============================
// ELEMENTOS
// ============================

const startScreen = document.getElementById("start-screen");

const startBtn = document.getElementById("start-btn");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("next-question");
const finishBtn = document.getElementById("finish-btn");
const restartBtn = document.getElementById("restart-btn");

// ============================
// CARREGAR JSON LOCAL
// ============================

// Se estiver usando arquivo questions.json
fetch("questions.json")
  .then((res) => res.json())
  .then((data) => {
    questions = data;
    populateBooks();
  });

// ============================
// POPULAR LIVROS
// ============================

function populateBooks() {
  const bookSelect = document.getElementById("book");
  const books = [...new Set(questions.map((q) => q.book))];

  books.sort();

  books.forEach((book) => {
    const option = document.createElement("option");
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  });
}

// ============================
// INICIAR JOGO
// ============================
function showScreen(screen) {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  endScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);

function startGame() {
  playerName = document.getElementById("player-name").value || "Anônimo";

  const difficulty = document.getElementById("difficulty").value;
  const testament = document.getElementById("testament").value;
  const book = document.getElementById("book").value;
  const limit = parseInt(document.getElementById("question-limit").value);

  filteredQuestions = questions.filter(
    (q) =>
      (difficulty === "all" || q.level === difficulty) &&
      (testament === "all" || q.testament === testament) &&
      (book === "all" || q.book === book),
  );

  // Embaralhar
  filteredQuestions.sort(() => Math.random() - 0.5);

  if (!isNaN(limit)) {
    filteredQuestions = filteredQuestions.slice(0, limit);
  }

  if (filteredQuestions.length === 0) {
    alert("Nenhuma questão encontrada com esses filtros.");
    return;
  }

  currentQuestionIndex = 0;
  score = 0;
  wrongQuestions = [];

  showScreen(quizScreen);
  scoreEl.textContent = 0;

  showQuestion();
}

// ============================
// MOSTRAR QUESTÃO
// ============================

function showQuestion() {
  nextBtn.classList.add("hidden");
  answersEl.innerHTML = "";

  const current = filteredQuestions[currentQuestionIndex];
  questionEl.textContent = current.question;
    console.log(current)
  current.answers.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = option.text;
    btn.addEventListener("click", () => selectAnswer(index));
    answersEl.appendChild(btn);
  });
}

// ============================
// SELECIONAR RESPOSTA
// ============================

function selectAnswer(index) {
  const current = filteredQuestions[currentQuestionIndex];
  const buttons = answersEl.querySelectorAll("button");

  buttons.forEach(btn => btn.disabled = true);

  const selectedAnswer = current.answers[index];

  if (!selectedAnswer) return;

  if (selectedAnswer.correct) {
    score++;
    scoreEl.textContent = score;

    if (buttons[index]) {
      buttons[index].classList.add("correct");
    }

  } else {
    if (buttons[index]) {
      buttons[index].classList.add("wrong");
    }

    const correctIndex = current.answers.findIndex(a => a.correct);

    if (correctIndex !== -1 && buttons[correctIndex]) {
      buttons[correctIndex].classList.add("correct");
    }

    wrongQuestions.push(current);
  }

  nextBtn.classList.remove("hidden");
}

// ============================
// PRÓXIMA QUESTÃO
// ============================

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
});

// ============================
// ENCERRAR QUIZ
// ============================

finishBtn.addEventListener("click", finishQuiz);

function finishQuiz() {
showScreen(endScreen);

  document.getElementById("player-result").textContent = playerName;
  document.getElementById("final-score").textContent = score;
  document.getElementById("total-correct").textContent = score;
  document.getElementById("total-wrong").textContent = wrongQuestions.length;

  generateReview();

  saveHighScore();
}

// ============================
// GERAR RELATÓRIO
// ============================

function generateReview() {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  if (wrongQuestions.length === 0) {
    reviewList.innerHTML = "<p class='correct'>Parabéns! Nenhum erro 🎉</p>";
    return;
  }

  wrongQuestions.forEach((q) => {
    const div = document.createElement("div");
    div.classList.add("review-item");

    // Encontrar resposta correta corretamente
    const correctAnswer = q.answers.find(a => a.correct);

    div.innerHTML = `
      <p><strong>Pergunta:</strong> ${q.question}</p>
      <p class="wrong">Sua resposta estava incorreta.</p>
      <p class="correct">Resposta correta: ${correctAnswer ? correctAnswer.text : "Não encontrada"}</p>
      <p><em>${q.book} - ${q.level}</em></p>
    `;

    reviewList.appendChild(div);
  });
}
// ============================
// SALVAR RECORD
// ============================

function saveHighScore() {
  const record = JSON.parse(localStorage.getItem("biblicalHighScore")) || {
    name: "",
    score: 0,
  };

  if (score > record.score) {
    localStorage.setItem(
      "biblicalHighScore",
      JSON.stringify({
        name: playerName,
        score: score,
      }),
    );
  }
}

// ============================
// REINICIAR
// ============================
restartBtn.addEventListener("click", () => {
  showScreen(startScreen);

  // resetar campos
  document.getElementById("player-name").value = "";
  document.getElementById("question-limit").value = "";
  score = 0;
  wrongQuestions = [];
  scoreEl.textContent = 0;
});