const apiKey = "bfd6b563";
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const favouriteMoviesList = document.getElementById("favouriteMovies");
let favourites = [];

// Fetch data from OMDB API
async function fetchMovies(query) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`
    );
    const data = await response.json();
    return data.Search || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Fetch movie details from IMDb API
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

// Display search results on the homepage
function displaySearchResults(results) {
  searchResults.innerHTML = "";
  results.forEach((movie) => {
    const movieCard = `
        <div class="card mb-3">
          <div class="row no-gutters">
            <div class="col-md-4">
              <img src="${movie.Poster}" class="card-img" alt="${movie.Title} Poster">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${movie.Title}</h5>
                <p class="card-text">${movie.Year}</p>
                ${
                  isMovieInFavourites(movie.imdbID)
                    ? `<a href="favourites.html" class="btn btn-success go-to-favourite">Go to Favourites</a>`
                    : `<button class="btn btn-primary add-favourite" data-id="${movie.imdbID}">Add to Favourites</button>`
                }

                <a href="movie.html?id=${movie.imdbID}" class="btn btn-secondary">Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    searchResults.insertAdjacentHTML("beforeend", movieCard);
  });
}

// Display movie details on the movie page
async function displayMovieDetails(movieId) {
  try {
    const movieData = await fetchMovieDetails(movieId);
    if (movieData && movieData.Response === "True") {
      const movieInfo = `
        <div class="card">
          <img src="${movieData.Poster}" class="card-img-top" alt="${movieData.Title} Poster">
          <div class="card-body">
            <h5 class="card-title">${movieData.Title}</h5>
            <p class="card-text">${movieData.Plot}</p>
            <p class="card-text">Released: ${movieData.Released}</p>
            <p class="card-text">Runtime: ${movieData.Runtime}</p>
            <p class="card-text">Genre: ${movieData.Genre}</p>
            <p class="card-text">Director: ${movieData.Director}</p>
          </div>
        </div>
      `;
      document.getElementById("movieDetails").innerHTML = movieInfo;
    } else {
      document.getElementById("movieDetails").innerHTML =
        "<p>Movie details not found.</p>";
    }
  } catch (error) {
    console.error("Error displaying movie details:", error);
    document.getElementById("movieDetails").innerHTML =
      "<p>Movie details not found.</p>";
  }
}



// Add movie to favourites list
async function addToFavourites(movieId) {
  if (!favourites.includes(movieId)) {
    const movieData = await fetchMovieDetails(movieId);
    if (movieData && movieData.Response === "True") {
      favourites.push(movieId);
      localStorage.setItem("favourites", JSON.stringify(favourites));
      // Change the button text to "Go to Favourite Page"
      const addButton = document.querySelector(`[data-id="${movieId}"]`);
      if (addButton) {
        addButton.textContent = "Go to Favourite Page";
        addButton.classList.remove("add-favourite");
        addButton.classList.add("go-to-favourite");
        addButton.style.backgroundColor = "#25D366"; // Set WhatsApp green color
        addButton.addEventListener("click", () => {
          window.location.href = "favourites.html";
        });
      }
      alert(`Movie "${movieData.Title}" added to My Favourite Movies page!`);
    } else {
      console.error("Error fetching movie details.");
    }
  }
}

// check if a movie is in the favourites list:
function isMovieInFavourites(movieId) {
  return favourites.includes(movieId);
}


// Remove Movie from Favourite
function removeFromFavourites(movieId) {
  favourites = favourites.filter((id) => id !== movieId);
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

function displayFavouriteMovies() {
  if (window.location.pathname.includes("favourites.html")) {
    favouriteMoviesList.innerHTML = "";
    if (favourites.length === 0) {
      favouriteMoviesList.innerHTML = "<p>No favourite movies added yet.</p>";
    } else {
      favourites.forEach(async (movieId) => {
        const movieData = await fetchMovieDetails(movieId);
        if (movieData && movieData.Response === "True") {
          const movieCard = `
            <div class="card mb-3">
              <div class="row no-gutters">
                <div class="col-md-4">
                  <img src="${movieData.Poster}" class="card-img" alt="${movieData.Title} Poster">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="card-title">${movieData.Title}</h5>
                    <p class="card-text">${movieData.Year}</p>
                    <a href="movie.html?id=${movieData.imdbID}" class="btn btn-secondary">Details</a>
                    <button class="btn btn-danger remove-favourite" data-id="${movieData.imdbID}">Remove from Favourites</button>
                  </div>
                </div>
              </div>
            </div>
          `;
          favouriteMoviesList.insertAdjacentHTML("beforeend", movieCard);
        }
      });
    }
  }
}



// Use event delegation to handle removing a movie from favourites
document.addEventListener("click", (event) => {
  const target = event.target;
  if (target.matches(".remove-favourite")) {
    const movieId = target.dataset.id;
    removeFromFavourites(movieId);
    displayFavouriteMovies(); // Update the favourites list on My Favourite Movies page
  }
});

// Initialize app
function init() {
  // Load favourites from localStorage
  const storedFavourites = localStorage.getItem("favourites");
  if (storedFavourites) {
    favourites = JSON.parse(storedFavourites);
    displayFavouriteMovies();
  }

  // Search movies as user types
  let typingTimer;
  const doneTypingInterval = 500;

  // Use event delegation to handle keyup event on searchInput
  document.addEventListener("keyup", (event) => {
    const target = event.target;
    if (target.matches("#searchInput")) {
      clearTimeout(typingTimer);
      const query = target.value.trim();
      if (query !== "") {
        typingTimer = setTimeout(async () => {
          const movies = await fetchMovies(query);
          displaySearchResults(movies);
        }, doneTypingInterval);
      } else {
        searchResults.innerHTML = "";
      }
    }
  });


  // Use event delegation to handle click event on searchResults
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("add-favourite")) {
      const movieId = target.dataset.id;
      addToFavourites(movieId);
      displayFavouriteMovies(); // Update the favourites list on My Favourite Movies page
    }
  });

  // Check if it's the movie page and display movie details
  if (window.location.pathname.includes("movie.html")) {
    const movieId = new URLSearchParams(window.location.search).get("id");
    if (movieId) {
      displayMovieDetails(movieId);
    } else {
      document.getElementById("movieDetails").innerHTML =
        "<p>Movie details not found.</p>";
    }
  }
}

init();

