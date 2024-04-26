const USER_KEY = 'user';

export function isLoggedIn() {
  return !!sessionStorage.getItem(USER_KEY);
}

export function login(username) {
  sessionStorage.setItem(USER_KEY, username);
}

export function logout() {
  sessionStorage.removeItem(USER_KEY);
}

export function getUser() {
  return sessionStorage.getItem(USER_KEY);
}