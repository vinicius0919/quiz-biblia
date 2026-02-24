// ============================
// ESTADO GLOBAL
// ============================

let questions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = [];
let playerName = "";

// ============================
// ELEMENTOS
// ============================

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");

const startBtn = document.getElementById("start-btn");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("next-question");
const finishBtn = document.getElementById("finish-btn");
const restartBtn = document.getElementById("restart-btn");

// ============================
// UTIL
// ============================

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

function showScreen(screen) {
  [startScreen, quizScreen, endScreen].forEach(s =>
    s.classList.add("hidden")
  );
  screen.classList.remove("hidden");
}

function resetGameState() {
  currentQuestionIndex = 0;
  score = 0;
  wrongQuestions = [];
  scoreEl.textContent = 0;
}

// ============================
// CARREGAR JSON
// ============================

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    populateBooks();
  })
  .catch(err => console.error("Erro ao carregar JSON:", err));

// ============================
// POPULAR LIVROS
// ============================

function populateBooks() {
  const bookSelect = document.getElementById("book");
  const books = [...new Set(questions.map(q => q.book))].sort();

  books.forEach(book => {
    const option = document.createElement("option");
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
  });
}

// ============================
// INICIAR JOGO
// ============================

startBtn.addEventListener("click", startGame);

function startGame() {
  playerName = document.getElementById("player-name").value || "Anônimo";

  const difficulty = document.getElementById("difficulty").value;
  const testament = document.getElementById("testament").value;
  const book = document.getElementById("book").value;
  const limit = parseInt(document.getElementById("question-limit").value);

  filteredQuestions = questions.filter(q =>
    (difficulty === "all" || q.level === difficulty) &&
    (testament === "all" || q.testament === testament) &&
    (book === "all" || q.book === book)
  );

  if (filteredQuestions.length === 0) {
    alert("Nenhuma questão encontrada com esses filtros.");
    return;
  }

  shuffle(filteredQuestions);

  if (!isNaN(limit)) {
    filteredQuestions = filteredQuestions.slice(0, limit);
  }
  console.log(difficulty, testament, book, limit)
  console.log(filteredQuestions, questions)
  resetGameState();
  showScreen(quizScreen);
  showQuestion();
}

// ============================
// MOSTRAR QUESTÃO
// ============================

function showQuestion() {
  nextBtn.classList.add("hidden");
  answersEl.innerHTML = "";

  const current = filteredQuestions[currentQuestionIndex];
  if (!current) return;
    console.log("Pergunta atual:", current);
  questionEl.textContent = current.question;

  current.answers.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = option.text;
    btn.onclick = () => selectAnswer(index);
    answersEl.appendChild(btn);
  });
}

// ============================
// SELECIONAR RESPOSTA
// ============================

function selectAnswer(index) {
  const current = filteredQuestions[currentQuestionIndex];
  if (!current) return;

  const buttons = answersEl.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);

  const selected = current.answers[index];
  if (!selected) return;

  const correctIndex = current.answers.findIndex(a => a.correct);

  if (selected.correct) {
    score++;
    scoreEl.textContent = score;
    buttons[index]?.classList.add("correct");
  } else {
    buttons[index]?.classList.add("wrong");
    buttons[correctIndex]?.classList.add("correct");
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
// FINALIZAR
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
// RELATÓRIO
// ============================

function generateReview() {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  if (wrongQuestions.length === 0) {
    reviewList.innerHTML = "<p class='correct'>Parabéns! Nenhum erro 🎉</p>";
    return;
  }

  wrongQuestions.forEach(q => {
    const correctAnswer = q.answers.find(a => a.correct);

    const div = document.createElement("div");
    div.classList.add("review-item");

    div.innerHTML = `
      <p><strong>Pergunta:</strong> ${q.question}</p>
      <p class="correct">Resposta correta: ${correctAnswer?.text}</p>
      <p><em>${q.book} - ${q.level}</em></p>
    `;

    reviewList.appendChild(div);
  });
}

// ============================
// RECORD
// ============================

function saveHighScore() {
  const record = JSON.parse(localStorage.getItem("biblicalHighScore")) || {
    name: "",
    score: 0
  };

  if (score > record.score) {
    localStorage.setItem("biblicalHighScore", JSON.stringify({
      name: playerName,
      score
    }));
  }
}

// ============================
// REINICIAR
// ============================

restartBtn.addEventListener("click", () => {
  showScreen(startScreen);
  resetGameState();

  document.getElementById("player-name").value = "";
  document.getElementById("question-limit").value = "";
});