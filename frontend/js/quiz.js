// quiz.js
const quizContainer = document.getElementById('quizContainer');
const questionNumber = document.getElementById('questionNumber');
const timerEl = document.getElementById('timer');
const questionImage = document.getElementById('questionImage');
const optionBtns = document.querySelectorAll('.option-btn');
const progress = document.getElementById('progress');
const quizMsg = document.getElementById('quizMsg');

let questions = []; 
let currentQ = 0;
let score = 0;
let startTime = 0;
let questionStartTime = 0;
let responses = [];
let quizFinished = false;

// Mezclar arrays
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a,b)=> a.sort - b.sort)
    .map(({value})=> value);
}

// Verifica si hay token y lo valida
async function checkLoginAndLoadQuiz() {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotLoggedModal();
    return;
  }

  try {
    const res = await fetch('/api/auth/validate-token', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Token inválido');
    const data = await res.json();
    // Token válido → cargar preguntas
    loadQuestions();
  } catch(err) {
    showNotLoggedModal();
  }
}

// Muestra el modal de "no logueado"
function showNotLoggedModal() {
  const modal = document.getElementById('notLoggedModal');
  modal.style.display = 'flex';
  setTimeout(() => window.location.href = 'index.html', 2000);
}

// Cargar preguntas
async function loadQuestions() {
  try {
    const res = await fetch('data/questions.json');
    if (!res.ok) throw new Error('No se pudieron cargar preguntas');
    const data = await res.json();
    questions = shuffleArray(data.questions.map(q => {
      const correctAnswer = q.options[q.correctIndex];
      const shuffledOptions = shuffleArray(q.options);
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: shuffledOptions.findIndex(opt => opt === correctAnswer)
      };
    }));
    startQuiz();
  } catch (err) {
    quizMsg.className = 'msg error';
    quizMsg.innerText = err.message;
    quizMsg.style.display = 'block';
  }
}

// Iniciar quiz
function startQuiz() {
  currentQ = 0;
  score = 0;
  responses = [];
  startTime = Date.now();
  showQuestion();
}

// Mostrar pregunta
function showQuestion() {
  if (currentQ >= questions.length) {
    finishQuiz();
    return;
  }
  const q = questions[currentQ];
  questionNumber.innerText = `Pregunta ${currentQ+1} / ${questions.length}`;
  questionImage.src = q.image;
  optionBtns.forEach((btn,i)=>{
    btn.innerText = q.options[i];
    btn.disabled = false;
  });
  questionStartTime = Date.now();
  startTimer(15, ()=>finishQuestion(null));
}

// Temporizador
let timerInterval;
function startTimer(seconds, callback){
  clearInterval(timerInterval);
  let timeLeft = seconds;
  timerEl.innerText = `Tiempo: ${timeLeft}s`;

  timerInterval = setInterval(()=>{
    timeLeft--;
    timerEl.innerText = `Tiempo: ${timeLeft}s`;
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      callback(null);
    }
  },1000);
}

// Manejar respuestas
optionBtns.forEach(btn => {
  btn.addEventListener('click', ()=>{
    const selectedIndex = parseInt(btn.dataset.index);
    finishQuestion(selectedIndex);
  });
});

// Finalizar pregunta
function finishQuestion(selectedIndex){
  if(currentQ >= questions.length) return;
  clearInterval(timerInterval);
  const q = questions[currentQ];
  const rawTime = (Date.now() - questionStartTime) / 1000;
const timeUsed = Math.floor(rawTime); // segundos enteros

let points = 0;
if (selectedIndex !== null && q.correctIndex === selectedIndex) {
  points = 10;
  if (timeUsed <= 3) points += 5; // bono de rapidez
  score += points;
}


responses.push({
  questionId: q._id,
  selected: selectedIndex,
  correct: q.correctIndex,
  points,
  timeUsed
});

  progress.innerText = `Puntaje: ${score} | Preguntas respondidas: ${responses.length} / ${questions.length}`;
  currentQ++;

  if(currentQ >= questions.length){
    finishQuiz();
  } else {
    setTimeout(showQuestion, 500);
  }
}

// Finalizar quiz
async function finishQuiz(){
  if(quizFinished) return;
  quizFinished = true;
  clearInterval(timerInterval);

  const totalCorrect = responses.filter(r=> r.correct===r.selected).length;
  const totalIncorrect = responses.filter(r=> r.selected!==null && r.correct!==r.selected).length;
  const totalUnanswered = responses.filter(r=> r.selected===null).length;
  const totalScore = score;
  const totalTimeUsed = Math.round((Date.now() - startTime)/1000);

  const attemptData = {
    correct: totalCorrect,
    incorrect: totalIncorrect,
    unanswered: totalUnanswered,
    score: totalScore,
    totalTime: totalTimeUsed
  };

  const token = localStorage.getItem('token');
  if(!token){
    showNotLoggedModal();
    return;
  }

  try {
    const res = await fetch('/api/quiz/attempt', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer ' + token
      },
      body: JSON.stringify(attemptData)
    });
    const data = await res.json();
    if(res.ok){
      window.location.href = `results.html?attemptId=${data.attemptId}`;
    } else {
      alert(data.msg || 'Error al guardar el intento');
    }
  } catch(err){
    console.error('Error al guardar intento:', err);
    alert('Error al guardar el intento');
  }
}

// ✅ Inicia todo
checkLoginAndLoadQuiz();

