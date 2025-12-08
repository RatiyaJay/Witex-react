// Authentication utility functions

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  removeUser();
  removeOrganization();
};

export const isSuperAdmin = () => {
  const user = getUser();
  return user?.role === 'SUPER_ADMIN';
};

export const getOrganization = () => {
  return localStorage.getItem('organization');
};

export const setOrganization = (organizationName) => {
  if (organizationName) {
    localStorage.setItem('organization', organizationName);
  }
};

export const removeOrganization = () => {
  localStorage.removeItem('organization');
};
