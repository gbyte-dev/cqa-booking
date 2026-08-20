// Local Storage utilities

export const storage = {
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setOrganization: (org) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organization', JSON.stringify(org));
    }
  },

  getOrganization: () => {
    if (typeof window !== 'undefined') {
      const org = localStorage.getItem('organization');
      return org ? JSON.parse(org) : null;
    }
    return null;
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
    }
  }
};