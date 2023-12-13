const mongoose = require('mongoose');
const Movie = require('./models/movie');

// Initialize MongoDB connection and Movie model
const initialize = async (connectionString) => {
    try {
        await mongoose.connect(connectionString);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};

// Create a new Movie in the collection
const addNewMovie = async (data) => {
    try {
        await Movie.create(data);
        console.log('New Movie added successfully');
    } catch (error) {
        console.error('Error adding new Movie:', error);
        throw error;
    }
};

// Return an array of all Movies for a specific page
const getAllMovies = async (page, perPage, title) => {
  try {
    const query = title ? { title: { $regex: new RegExp(title, 'i') } } : {};
    const options = {
      skip: (page - 1) * perPage,
      limit: perPage,
    };
    const movies = await Movie.find(query, null, options);
    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

// Return a single Movie object whose "_id" value matches the "Id" parameter
const getMovieById = async (Id) => {
    try {
        const movie = await Movie.findById(Id);
        return movie;
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        throw error;
    }
};

// Update an existing Movie whose "_id" value matches the "Id" parameter
const updateMovieById = async (Id, data) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(Id, data, { new: true });
        console.log(updatedMovie);
        return updatedMovie;
    } catch (error) {
        console.error('Error updating movie by ID:', error);
        throw error;
    }
};

// Delete an existing Movie whose "_id" value matches the "Id" parameter
const deleteMovieById = async (Id) => {
    try {
        await Movie.deleteOne({ _id: Id });
        console.log('Movie deleted successfully');
    } catch (error) {
        console.error('Error deleting movie by ID:', error);
        throw error;
    }
};
const getTopRatedMoviesByGenre = async (genre, limit = 5) => {
    try {
        const query = genre ? { genres: { $in: [genre] } } : {};
        const options = {
            limit,
            sort: { 'imdb.rating': -1, 'tomatoes.viewer.rating': -1 },
        };

        const topRatedMovies = await Movie.find(query, null, options);
        return topRatedMovies;
    } catch (error) {
        console.error("Error fetching top-rated movies by genre:", error);
        throw error;
    }
};
const getAllGenres = () => {
    // You can fetch this list from a database or define it statically
    const allGenres = [
        'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
        'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
        'Thriller', 'War', 'Western'
    ];
    return allGenres;
};
const getAllLanguages = async () => {
    try {
        const uniqueLanguages = await Movie.distinct('languages');
        return uniqueLanguages.filter(language => language); 
    } catch (error) {
        console.error("Error fetching all languages:", error);
        throw error;
    }
};
const getMoviesByLanguageAndGenre = async (language, genre, limit = 5) => {
    try {
        const query = {};
        if (language) {
            query.languages = { $in: [language] };
        }
        if (genre) {
            query.genres = { $in: [genre] };
        }

        const options = {
            limit,
            sort: { 'imdb.rating': -1, 'tomatoes.viewer.rating': -1 },
        };

        const movies = await Movie.find(query, null, options);
        return movies;
    } catch (error) {
        console.error("Error fetching movies by language and genre:", error);
        throw error;
    }
};
module.exports = {
    initialize,
    addNewMovie,
    getAllMovies,
    getMovieById,
    updateMovieById,
    deleteMovieById,
    getTopRatedMoviesByGenre,
    getAllGenres,
    getMoviesByLanguageAndGenre,
    getAllLanguages
};