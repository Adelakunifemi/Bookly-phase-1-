import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/BookDetails.css';

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    try {
      const data = await api.getBookById(id);
      setBook(data);
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('Please log in to rate books');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const data = await api.rateBook(id, rating, token);
      setUserRating(rating);
      setMessage('Rating submitted successfully!');
      
      // Reload book details to get updated rating
      await loadBookDetails();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to submit rating');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="error-container">
        <p>{error || 'Book not found'}</p>
        <button onClick={() => navigate('/home')} className="btn-back">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="book-details-container">
      <button onClick={() => navigate('/home')} className="btn-back-top">
        ← Back to Books
      </button>

      {message && <div className="message">{message}</div>}

      <div className="book-details-content">
        <div className="book-cover-section">
          <img 
            src={book.coverImage || 'https://via.placeholder.com/400x600?text=No+Cover'} 
            alt={book.title}
            className="book-cover-large"
          />
        </div>

        <div className="book-info-section">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">by {book.author}</p>
          
          {book.genre && (
            <span className="book-genre-tag">{book.genre}</span>
          )}

          <div className="rating-section">
            <h3>Rating</h3>
            <div className="average-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star}
                    className={`star ${star <= Math.round(book.averageRating || 0) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-number">
                {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="rating-count">
                ({book.ratings?.length || 0} {book.ratings?.length === 1 ? 'rating' : 'ratings'})
              </span>
            </div>

            <div className="user-rating-section">
              <p><strong>Rate this book:</strong></p>
              <div className="user-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hoverRating || userRating) ? 'filled' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{book.description || 'No description available.'}</p>
          </div>

          <div className="meta-info">
            <p>
              <strong>Added by:</strong> {book.addedBy?.username || 'Unknown'}
            </p>
            <p>
              <strong>Date added:</strong> {new Date(book.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;