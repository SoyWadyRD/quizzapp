// Registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const registerMsg = document.getElementById('registerMsg'); // div para mostrar mensaje
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Mostrar mensaje en el div
        registerMsg.innerHTML = `<p style="color: green;">${data.msg}</p>`;
        registerForm.reset();

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } else {
        registerMsg.innerHTML = `<p style="color: red;">${data.msg}</p>`;
      }

    } catch (err) {
      console.error(err);
      registerMsg.innerHTML = `<p style="color: red;">Error al registrarse</p>`;
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const loginMsg = document.getElementById('loginMsg'); // div para mostrar mensaje
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        loginMsg.innerHTML = `<p style="color: green;">Login exitoso! Bienvenido ${data.username}</p>`;

        // Redirigir a home.html después de 1 segundo
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);

      } else {
        loginMsg.innerHTML = `<p style="color: red;">${data.msg}</p>`;
      }

    } catch (err) {
      console.error(err);
      loginMsg.innerHTML = `<p style="color: red;">Error al iniciar sesión</p>`;
    }
  });
}
