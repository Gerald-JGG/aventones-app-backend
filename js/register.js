document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = new FormData(form);
    const firstName = data.get('firstName').trim();
    const lastName = data.get('lastName').trim();
    const email = data.get('email').trim();
    const password = data.get('password');
    const repeatPassword = data.get('repeatPassword');
    const address = data.get('address').trim();
    const country = data.get('country');
    const state = data.get('state').trim();
    const city = data.get('city').trim();
    const phone = data.get('phone').trim();

    // Validación de contraseñas
    if (password !== repeatPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Verificar si el email ya existe
    if (users.some(user => user.email === email)) {
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
      rides: [], // Array para los rides del usuario
      bookings: [], // Array para las reservas del usuario
      createdAt: new Date().toISOString()
    };

    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Iniciar sesión automáticamente
    loginUser(newUser);

    // Redirigir al home
    window.location.href = '/home.html';
  });

  // Función para generar ID único
  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Función para mostrar errores de forma discreta
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
    const form = document.getElementById('registerForm');
    form.parentNode.insertBefore(errorDiv, form);

    // Remover después de 4 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 4000);
  }

  // Función para iniciar sesión (guardar usuario actual)
  function loginUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
});