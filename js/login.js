document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    // Buscar en usuarios regulares
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Usuario regular encontrado
      user.userType = 'user'; // Asegurar que tenga el tipo correcto
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = '/home.html';
      return;
    }

    // Buscar en drivers
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    const driver = drivers.find(d => d.email === email && d.password === password);

    if (driver) {
      // Driver encontrado
      driver.userType = 'driver'; // Asegurar que tenga el tipo correcto
      localStorage.setItem('currentUser', JSON.stringify(driver));
      window.location.href = '/home.html';
      return;
    }

    // No se encontró ningún usuario
    showError('Email o contraseña incorrectos');
  });

  function showError(message) {
    // Remover error anterior si existe
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Crear nuevo mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      background-color: #f8d7da;
      color: #721c24;
      padding: 8px 12px;
      border: 1px solid #f1aeb5;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 14px;
      text-align: center;
    `;
    errorDiv.textContent = message;

    // Insertar antes del formulario
    const form = document.querySelector('.login-form');
    form.parentNode.insertBefore(errorDiv, form);

    // Remover después de 4 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 4000);
  }
});