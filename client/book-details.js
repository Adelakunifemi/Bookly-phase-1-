const API_URL = 'http://localhost:5000/api';
let currentBookId = null;

// Get book ID from URL
function getBookIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load book details when page loads
document.addEventListener('DOMContentLoaded', async () => {
    currentBookId = getBookIdFromUrl();
    
    if (!currentBookId) {
        showMessage('No book ID provided', 'error');
        return;
    }
    
    await loadBookDetails();
    setupRatingStars();
});

// Load book details from API
async function loadBookDetails() {
    try {
        const response = await fetch(`${API_URL}/books/${currentBookId}`);
        
        if (!response.ok) {
            throw new Error('Book not found');
        }
        
        const book = await response.json();
        displayBookDetails(book);
        
    } catch (error) {
        console.error('Error loading book:', error);
        showMessage('Error loading book details. Please try again.', 'error');
        document.getElementById('loading').style.display = 'none';
    }
}

// Display book details on the page
function displayBookDetails(book) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('bookDetails').style.display = 'block';
    
    // Set book cover
    const coverImg = document.getElementById('bookCover');
    coverImg.src = book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover';
    coverImg.alt = book.title;
    
    // Set book info
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookGenre').textContent = book.genre || 'General';
    document.getElementById('bookDescription').textContent = book.description || 'No description available.';
    
    // Set added by info
    const addedByUser = book.addedBy?.username || 'Unknown';
    const addedDate = new Date(book.createdAt).toLocaleDateString();
    document.getElementById('addedBy').textContent = addedByUser;
    document.getElementById('addedDate').textContent = addedDate;
    
    // Display average rating
    displayAverageRating(book.averageRating || 0, book.ratings?.length || 0);
}

// Display average rating with stars
function displayAverageRating(rating, count) {
    const avgRatingElement = document.getElementById('averageRating');
    const ratingCountElement = document.getElementById('ratingCount');
    const starsContainer = document.getElementById('averageStars');
    
    avgRatingElement.textContent = rating.toFixed(1);
    ratingCountElement.textContent = `(${count} ${count === 1 ? 'rating' : 'ratings'})`;
    
    // Create star display
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        
        if (i <= Math.round(rating)) {
            star.classList.add('filled');
        }
        
        starsContainer.appendChild(star);
    }
}

// Setup interactive rating stars
function setupRatingStars() {
    const stars = document.querySelectorAll('#userRatingStars .star');
    
    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
        
        // Click to rate
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            submitRating(rating);
        });
    });
    
    // Reset on mouse leave
    const container = document.getElementById('userRatingStars');
    container.addEventListener('mouseleave', function() {
        resetStars();
    });
}

// Highlight stars on hover
function highlightStars(rating) {
    const stars = document.querySelectorAll('#userRatingStars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

// Reset stars to unfilled state
function resetStars() {
    const stars = document.querySelectorAll('#userRatingStars .star');
    stars.forEach(star => {
        star.classList.remove('hover');
    });
}

// Submit rating to API
async function submitRating(rating) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showMessage('Please log in to rate books', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/books/${currentBookId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit rating');
        }
        
        const data = await response.json();
        
        // Update the display with new average
        showMessage('Rating submitted successfully!', 'success');
        displayAverageRating(data.averageRating, data.totalRatings);
        
        // Fill the stars the user selected
        fillUserStars(rating);
        
    } catch (error) {
        console.error('Error submitting rating:', error);
        showMessage(error.message, 'error');
    }
}

// Fill user's selected stars
function fillUserStars(rating) {
    const stars = document.querySelectorAll('#userRatingStars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    setTimeout(()