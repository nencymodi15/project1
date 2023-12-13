const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Import the MovieDB module
const movieDB = require("../movieDB");
router.get('/getSelect', async (req, res) => {
    const allGenres = await movieDB.getAllGenres();
    const alllang = await movieDB.getAllLanguages();
    res.render('moviByGenra', { genres: allGenres ,languages:alllang });
});

router.get('/top-rated-movies', async (req, res) => {
    const selectedGenre = req.query.genre;
    const selectedLang = req.query.language;
    const topRatedMovies = await movieDB.getTopRatedMoviesByGenre(selectedGenre);
    const filterData = await movieDB.getMoviesByLanguageAndGenre(selectedLang);
    if(filterData){
        const data =JSON.parse(JSON.stringify(filterData));
        res.render('searchResults', {  pageTitle: "Search Results", movies: data });
    }
    else if(topRatedMovies){
        
        const data =JSON.parse(JSON.stringify(topRatedMovies));
        res.render('searchResults', {  pageTitle: "Search Results", movies: data });
    }
   else{
    return res.status(400).json({ errors: errors.array() });
   }
    
});


router
    .route('/search-form')
    .get((req, res) => {
    res.render('searchForm', { pageTitle: "Search Form" });
})
    .post( [
    check('page').isInt().toInt(),
    check('perPage').isInt().toInt(),
    check('title').optional(),
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { page, perPage, title } = req.body;

        // Call the getAllMovies function from movieDB.js
        const moviesData = await movieDB.getAllMovies(page, perPage, title);

        //console.log('Fetched Movies:', moviesData);

        res.render('searchResults', { pageTitle: "Search Results", movies: moviesData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router
    .route('/')
    // Route to get all movies with query parameters
    .get([
    check('page').isInt().toInt(),
    check('perPage').isInt().toInt(),
    check('title').optional(),
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { page, perPage, title } = req.query;

        // Call the getAllMovies function from movieDB.js
        const moviesData = await movieDB.getAllMovies(page, perPage, title);

        res.json(moviesData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
    // Route to add a new movie
    .post( async (req, res) => {
    try {
        const data = { ...req.body };
        res.json(data);
        const newMovie = await movieDB.addNewMovie(data);
        res.send("New movie added successfully")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router
    .route('/:id')
    // Route to get a specific movie by id
    .get(async (req, res) => {
    try {
        // Call the getMovieById function from movieDB.js
        const movieData = await movieDB.getMovieById(req.params.id);

        if (!movieData) {
            return res.status(404).send("Movie not found");
        }

        res.json(movieData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
    // Route to update a specific movie by id
    .put(async (req, res) => {
  try {
    const movieId = req.params.id;
    const data = { ...req.body };
    const updatedMovie = await movieDB.updateMovieById(movieId,data);

    if (!updatedMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(updatedMovie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})
    // Route to delete a specific movie by id
    .delete(async (req, res) => {
    try {
        // Call the deleteMovieById function from movieDB.js
        await movieDB.deleteMovieById(req.params.id);

        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;
