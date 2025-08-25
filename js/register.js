document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.reg-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Obtener valores de los campos
    const firstName = form.querySelectorAll('input[type="text"]')[0].value.trim();
    const lastName = form.querySelectorAll('input[type="text"]')[1].value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const repeatPassword = form.querySelectorAll('input[type="password"]')[1].value;
    const address = form.querySelectorAll('input[type="text"]')[2].value.trim();
    const country = form.querySelector('select').value;
    const state = form.querySelectorAll('input[type="text"]')[3].value.trim();
    const city = form.querySelectorAll('input[type="text"]')[4].value.trim();
    const phone = form.querySelector('input[type="tel"]').value.trim();

    // Validaciones
    if (!firstName || !lastName || !email || !password || !repeatPassword || !address || !country || !state || !city || !phone) {
      showError('Por favor completa todos los campos');
      return;
    }

    // Validación de contraseñas
    if (password !== repeatPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Por favor ingresa un email válido');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];

    // Verificar si el email ya existe en users o drivers
    if (users.some(user => user.email === email) || drivers.some(driver => driver.email === email)) {
      showError('Este email ya está registrado');
      return;
    }

    // Crear nuevo usuario con ID único
    const newUser = {
      id: generateUserId(),
      firstName,
      lastName,
      email,
      password,
      address,
      country,
      state,
      city,
      phone,
      publicName: firstName, // Nombre público por defecto
      publicBio: '',
      userType: 'user', // Identificador de tipo de usuario
      requests: [], // Array para las solicitudes de rides que hace el usuario
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Iniciar sesión automáticamente
    loginUser(newUser);

    // Mostrar mensaje de éxito y redirigir
    showSuccess('Registro exitoso como usuario. Bienvenido!');
    setTimeout(() => {
      window.location.href = '/home.html';
    }, 1500);
  });

  // Función para generar ID único
  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Función para mostrar errores
  function showError(message) {
    showMessage(message, 'error');
  }

  // Función para mostrar mensajes de éxito
  function showSuccess(message) {
    showMessage(message, 'success');
  }

  // Función genérica para mostrar mensajes
  function showMessage(message, type) {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    if (type === 'error') {
      messageDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f1aeb5;
      `;
    } else if (type === 'success') {
      messageDiv.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      `;
    }
    
    messageDiv.style.cssText += `
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
      text-align: center;
    `;
    messageDiv.textContent = message;

    // Insertar antes del formulario
    const form = document.querySelector('.reg-form');
    form.parentNode.insertBefore(messageDiv, form);

    // Remover después de 4 segundos (excepto mensajes de éxito)
    if (type !== 'success') {
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 4000);
    }
  }

  // Función para iniciar sesión (guardar usuario actual)
  function loginUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
});