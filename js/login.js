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

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Buscar usuario por email y contraseña
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showError('Email o contraseña incorrectos');
      return;
    }

    // Iniciar sesión
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Redirigir al home
    window.location.href = '/home.html';
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