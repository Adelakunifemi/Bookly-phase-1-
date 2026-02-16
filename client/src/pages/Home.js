import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/Home.css';

function Home() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || userData === 'undefined') {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
      loadBooks();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const data = await api.searchBooks(searchQuery);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const viewBookDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="navbar">
        <div className="nav-content">
          <h1 className="logo">📚 Bookly</h1>
          <div className="nav-right">
            <span className="username">Hi, {user?.username}!</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Discover Your Next Great Read</h2>
          <p>Search millions of books and share your recommendations</p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for books by title, author, or genre..."
              className="search-input"
            />
            <button type="submit" className="btn-search">Search</button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="books-section">
          <div className="container">
            <h3>Search Results</h3>
            <div className="books-grid">
              {searchResults.map((book, index) => (
                <div key={index} className="book-card">
                  <img 
                    src={book.coverImage || 'https://via.placeholder.com/280x400?text=No+Cover'} 
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p className="book-author">{book.author}</p>
                    <p className="book-description">
                      {book.description ? book.description.substring(0, 100) + '...' : 'No description available'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Books */}
      <section className="books-section">
        <div className="container">
          <h3>All Book Recommendations</h3>
          {loading ? (
            <p className="loading">Loading books...</p>
          ) : books.length === 0 ? (
            <p className="no-books">No books available yet. Be the first to add one!</p>
          ) : (
            <div className="books-grid">
              {books.map((book) => (
                <div 
                  key={book._id} 
                  className="book-card clickable"
                  onClick={() => viewBookDetails(book._id)}
                >
                  <img 
                    src={book.coverImage || 'https://via.placeholder.com/280x400?text=No+Cover'} 
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p className="book-author">{book.author}</p>
                    <div className="book-rating">
                      {book.averageRating ? book.averageRating.toFixed(1) : '0.0'} 
                      <span className="rating-count">
                        ({book.ratings?.length || 0} ratings)
                      </span>
                    </div>
                    <span className="book-genre">{book.genre || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;