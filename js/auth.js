// auth.js - Sistema de autenticación global mejorado

// Verificar si hay usuario logueado
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Verificar si el usuario está logueado
function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

// Verificar si el usuario actual es un driver
function isCurrentUserDriver() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.userType === 'driver';
}

// Verificar si el usuario actual es un user regular
function isCurrentUserRegularUser() {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.userType !== 'driver';
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/login.html';
}

// Actualizar información del usuario actual
function updateCurrentUser(updatedData) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  // Actualizar usuario actual
  const updatedUser = { ...currentUser, ...updatedData };
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));

  // Actualizar en la lista correspondiente (users o drivers)
  if (currentUser.userType === 'driver') {
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    const driverIndex = drivers.findIndex(driver => driver.id === currentUser.id);
    
    if (driverIndex !== -1) {
      drivers[driverIndex] = updatedUser;
      localStorage.setItem('drivers', JSON.stringify(drivers));
    }
  } else {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  return true;
}

// Obtener rides del usuario actual (solo para drivers)
function getCurrentUserRides() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType !== 'driver') return [];
  return currentUser.rides || [];
}

// Agregar ride al usuario actual (solo para drivers)
function addRideToCurrentUser(rideData) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType !== 'driver') return false;

  const newRide = {
    id: 'ride_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId: currentUser.id,
    driverName: currentUser.publicName || currentUser.firstName,
    ...rideData,
    createdAt: new Date().toISOString()
  };

  currentUser.rides = currentUser.rides || [];
  currentUser.rides.push(newRide);

  return updateCurrentUser({ rides: currentUser.rides }) ? newRide : false;
}

// Eliminar ride del usuario actual (solo para drivers)
function removeRideFromCurrentUser(rideId) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType !== 'driver' || !currentUser.rides) return false;

  const updatedRides = currentUser.rides.filter(ride => ride.id !== rideId);
  return updateCurrentUser({ rides: updatedRides });
}

// Obtener bookings del usuario actual (solo para drivers)
function getCurrentUserBookings() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType !== 'driver') return [];
  return currentUser.bookings || [];
}

// Obtener todos los rides disponibles (de todos los drivers)
function getAllAvailableRides() {
  const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
  const allRides = [];
  
  drivers.forEach(driver => {
    if (driver.rides) {
      driver.rides.forEach(ride => {
        allRides.push({
          ...ride,
          driverInfo: {
            id: driver.id,
            name: driver.publicName || driver.firstName,
            email: driver.email
          }
        });
      });
    }
  });
  
  return allRides;
}

// Buscar rides por criterios
function searchRides(from, to, selectedDays = []) {
  const allRides = getAllAvailableRides();
  
  return allRides.filter(ride => {
    const matchesFrom = !from || ride.from.toLowerCase().includes(from.toLowerCase());
    const matchesTo = !to || ride.to.toLowerCase().includes(to.toLowerCase());
    
    let matchesDays = true;
    if (selectedDays.length > 0) {
      matchesDays = selectedDays.some(day => ride.days && ride.days.includes(day));
    }
    
    return matchesFrom && matchesTo && matchesDays;
  });
}

// Solicitar un ride (solo para users regulares)
function requestRide(rideId, message = '') {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType === 'driver') return false;

  const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
  let rideFound = false;
  
  // Buscar el ride y agregar la solicitud
  drivers.forEach(driver => {
    if (driver.rides) {
      driver.rides.forEach(ride => {
        if (ride.id === rideId) {
          rideFound = true;
          
          // Crear solicitud de booking
          const bookingRequest = {
            id: 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            rideId: ride.id,
            requesterId: currentUser.id,
            requesterName: currentUser.firstName + ' ' + currentUser.lastName,
            requesterEmail: currentUser.email,
            message: message,
            status: 'pending', // pending, accepted, rejected
            createdAt: new Date().toISOString()
          };
          
          // Agregar a los bookings del driver
          driver.bookings = driver.bookings || [];
          driver.bookings.push(bookingRequest);
        }
      });
    }
  });
  
  if (rideFound) {
    localStorage.setItem('drivers', JSON.stringify(drivers));
    return true;
  }
  
  return false;
}

// Proteger páginas (llamar en páginas que requieren login)
function requireLogin() {
  if (!isUserLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Proteger páginas que requieren ser driver
function requireDriver() {
  if (!requireLogin()) return false;
  
  if (!isCurrentUserDriver()) {
    alert('Acceso denegado. Esta página es solo para conductores.');
    window.location.href = '/home.html';
    return false;
  }
  return true;
}

// Proteger páginas que son solo para drivers (bookings)
function requireDriverForBookings() {
  if (!requireLogin()) return false;
  
  if (!isCurrentUserDriver()) {
    alert('Los usuarios regulares no tienen acceso a la gestión de reservas.');
    window.location.href = '/home.html';
    return false;
  }
  return true;
}

// Inicializar página con usuario logueado
function initUserPage() {
  if (!requireLogin()) return;
  
  const currentUser = getCurrentUser();
  
  // Actualizar elementos de la UI con información del usuario
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = currentUser.publicName || currentUser.firstName;
  });

  // Ocultar/mostrar elementos según el tipo de usuario
  updateUIForUserType(currentUser);

  return currentUser;
}

// Actualizar UI según el tipo de usuario
function updateUIForUserType(user) {
  // Si es usuario regular, ocultar enlaces de bookings en la navegación
  if (user.userType !== 'driver') {
    const bookingLinks = document.querySelectorAll('a[href="/bookings.html"], a[href="bookings.html"]');
    bookingLinks.forEach(link => {
      const listItem = link.parentElement;
      if (listItem && listItem.tagName === 'LI') {
        listItem.style.display = 'none';
      }
    });
    
    // Ocultar botón de "New Ride" si existe
    const newRideButton = document.querySelector('.new-ride-button');
    if (newRideButton) {
      newRideButton.style.display = 'none';
    }
    
    // Si están en la página de rides y no es driver, redirigir
    if (window.location.pathname.includes('rides.html') || 
        window.location.pathname.includes('addride.html') || 
        window.location.pathname.includes('editride.html')) {
      alert('Los usuarios regulares no pueden gestionar rides. Serás redirigido al inicio.');
      window.location.href = '/home.html';
    }
  }
}

// Función para inicializar la página de home con funcionalidad de búsqueda
function initHomePage() {
  if (!requireLogin()) return;
  
  const currentUser = initUserPage();
  
  // Cargar y mostrar rides disponibles
  displayAvailableRides();
  
  // Configurar funcionalidad de búsqueda si existe
  const searchButton = document.querySelector('.search-box button');
  if (searchButton) {
    searchButton.addEventListener('click', handleRideSearch);
  }
}

// Mostrar rides disponibles en la página home
function displayAvailableRides() {
  const ridesTable = document.querySelector('main table tbody');
  if (!ridesTable) return;
  
  const rides = getAllAvailableRides();
  
  // Limpiar tabla existente
  ridesTable.innerHTML = '';
  
  if (rides.length === 0) {
    ridesTable.innerHTML = '<tr><td colspan="7">No hay rides disponibles</td></tr>';
    return;
  }
  
  rides.forEach(ride => {
    const row = document.createElement('tr');
    const isCurrentUserDriver = getCurrentUser().userType === 'driver';
    
    row.innerHTML = `
      <td class="driver">
        <img src="assets/img/user-icon.png" alt="icon" />
        ${ride.driverInfo.name}
      </td>
      <td><a href="#">${ride.from}</a></td>
      <td>${ride.to}</td>
      <td>${ride.seats || 1}</td>
      <td>${ride.vehicleMake} ${ride.vehicleModel} ${ride.vehicleYear || ''}</td>
      <td>$${ride.fee || 0}</td>
      <td>
        ${isCurrentUserDriver ? 
          '<span style="color: #999;">N/A</span>' : 
          `<a href="#" onclick="requestRideAction('${ride.id}')">Request</a>`
        }
      </td>
    `;
    
    ridesTable.appendChild(row);
  });
}

// Manejar solicitud de ride
function requestRideAction(rideId) {
  const message = prompt('¿Deseas agregar un mensaje a tu solicitud? (opcional)');
  if (message === null) return; // Usuario canceló
  
  if (requestRide(rideId, message)) {
    alert('Solicitud de ride enviada correctamente');
    displayAvailableRides(); // Refrescar la tabla
  } else {
    alert('Error al enviar la solicitud');
  }
}

// Manejar búsqueda de rides
function handleRideSearch() {
  const fromSelect = document.querySelector('.search-box select:first-of-type');
  const toSelect = document.querySelector('.search-box select:last-of-type');
  const dayCheckboxes = document.querySelectorAll('.search-box input[type="checkbox"]');
  
  const from = fromSelect ? fromSelect.value : '';
  const to = toSelect ? toSelect.value : '';
  const selectedDays = Array.from(dayCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.nextSibling.textContent.trim());
  
  const filteredRides = searchRides(from, to, selectedDays);
  
  // Actualizar la tabla con los resultados filtrados
  const ridesTable = document.querySelector('main table tbody');
  if (!ridesTable) return;
  
  ridesTable.innerHTML = '';
  
  if (filteredRides.length === 0) {
    ridesTable.innerHTML = '<tr><td colspan="7">No se encontraron rides con los criterios seleccionados</td></tr>';
    return;
  }
  
  const isCurrentUserDriver = getCurrentUser().userType === 'driver';
  
  filteredRides.forEach(ride => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="driver">
        <img src="assets/img/user-icon.png" alt="icon" />
        ${ride.driverInfo.name}
      </td>
      <td><a href="#">${ride.from}</a></td>
      <td>${ride.to}</td>
      <td>${ride.seats || 1}</td>
      <td>${ride.vehicleMake} ${ride.vehicleModel} ${ride.vehicleYear || ''}</td>
      <td>$${ride.fee || 0}</td>
      <td>
        ${isCurrentUserDriver ? 
          '<span style="color: #999;">N/A</span>' : 
          `<a href="#" onclick="requestRideAction('${ride.id}')">Request</a>`
        }
      </td>
    `;
    
    ridesTable.appendChild(row);
  });
  
  // Actualizar el texto descriptivo
  const ridePath = document.querySelector('.ride-path');
  if (ridePath) {
    ridePath.innerHTML = `Rides encontrados de <b><i>${from || 'cualquier origen'}</i></b> a <b><i>${to || 'cualquier destino'}</i></b>`;
  }
}