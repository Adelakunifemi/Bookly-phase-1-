const API_URL = 'https://b00kly.onrender.com/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return response.json();
  },

  // Books
  searchBooks: async (query) => {
    const response = await fetch(`${API_URL}/books/search?query=${encodeURIComponent(query)}`);
    return response.json();
  },

  getAllBooks: async () => {
    const response = await fetch(`${API_URL}/books`);
    return response.json();
  },

  getBookById: async (id) => {
    const response = await fetch(`${API_URL}/books/${id}`);
    return response.json();
  },

  addBook: async (bookData, token) => {
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(bookData)
    });
    return response.json();
  },

  rateBook: async (bookId, rating, token) => {
    const response = await fetch(`${API_URL}/books/${bookId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating })
    });
    return response.json();
  }
};