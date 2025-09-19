// Obtener attemptId de la URL
const params = new URLSearchParams(window.location.search);
const attemptId = params.get('attemptId');
const statsDiv = document.getElementById('stats');

if(!attemptId){
  statsDiv.innerHTML = '<p class="error">No se encontró el intento</p>';
} else {
  fetch(`/api/quiz/result/${attemptId}`, {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(res => res.json())
.then(data => {
  if(!data){
    statsDiv.innerHTML = '<p class="error">No se encontró el intento</p>';
    return;
  }

  statsDiv.innerHTML = `
    <p><strong>Correctas:</strong> ${data.correct}</p>
    <p><strong>Incorrectas:</strong> ${data.incorrect}</p>
    <p><strong>Sin responder:</strong> ${data.unanswered}</p>
    <p><strong>Puntaje total:</strong> ${data.score}</p>
    <p><strong>Tiempo total:</strong> ${data.totalTime}s</p>
    <p style="margin-top:15px; font-weight:bold; color:#00bfff;">
      ${data.score >= 500 ? '¡Excelente trabajo!' : '¡Buen intento, sigue practicando!'}
    </p>
  `;
})

  .catch(err => {
    console.error(err);
    statsDiv.innerHTML = '<p class="error">Error al cargar los resultados</p>';
  });
}
