const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    title: String,
    plot: String,
    genres: [String],
    runtime: Number,
    cast: [String],
    poster: String,
    fullplot: String,
    languages: [String],
    released: Date,
    directors: [String],
    writers: [String],
    awards: {
        wins: Number,
        nominations: Number,
        text: String
    },
    lastupdated: Date,
    year: Number,
    imdb: {
        rating: Number,
        votes: Number,
        id: Number
    },
    countries: [String],
    type: String,
    tomatoes: {
        viewer: {
            rating: Number,
            numReviews: Number,
            meter: Number
        },
        critic: {
            rating: Number,
            numReviews: Number,
            meter: Number
        },
        dvd: Date,
        website: String,
        production: String,
        fresh: Number,
        rotten: Number,
        lastUpdated: Date,
        
    },
    num_mflix_comments: Number
});

let Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
