// auth.js - Sistema de autenticación global

// Verificar si hay usuario logueado
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Verificar si el usuario está logueado
function isUserLoggedIn() {
  return getCurrentUser() !== null;
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

  // Actualizar en la lista de usuarios
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
  }

  return true;
}

// Obtener rides del usuario actual
function getCurrentUserRides() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.rides || [] : [];
}

// Agregar ride al usuario actual
function addRideToCurrentUser(rideData) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const newRide = {
    id: 'ride_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId: currentUser.id,
    ...rideData,
    createdAt: new Date().toISOString()
  };

  currentUser.rides = currentUser.rides || [];
  currentUser.rides.push(newRide);

  return updateCurrentUser({ rides: currentUser.rides }) ? newRide : false;
}

// Eliminar ride del usuario actual
function removeRideFromCurrentUser(rideId) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.rides) return false;

  const updatedRides = currentUser.rides.filter(ride => ride.id !== rideId);
  return updateCurrentUser({ rides: updatedRides });
}

// Obtener bookings del usuario actual
function getCurrentUserBookings() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.bookings || [] : [];
}

// Proteger páginas (llamar en páginas que requieren login)
function requireLogin() {
  if (!isUserLoggedIn()) {
    window.location.href = '/login.html';
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

  return currentUser;
}