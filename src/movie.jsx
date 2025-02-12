import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import "./style.css";

const Movie = () => {
  const [search, setSearch] = useState("avengers");
  const [data, setData] = useState([]); // Stores currently displayed movies
  const [latestMovies, setLatestMovies] = useState([]); // Stores latest searched movies
  const [likedMovies, setLikedMovies] = useState(() => {
    const storedLikes = localStorage.getItem("likedMovies");
    return storedLikes ? JSON.parse(storedLikes) : {};
  });
  const [view, setView] = useState("HOME"); // Tracks current view
  const [lastSearchMovies, setLastSearchMovies] = useState([]); // Stores last searched movies

  useEffect(() => {
    if (view === "HOME") {
      setSearch("avengers"); // Reset search term
      fetchMovies("avengers"); // Fetch Avengers movies
    } else if (view === "VISITED") {
      setData(lastSearchMovies); // Restore last searched movies
    } else if (view === "LIKED") {
      fetchAllLikedMovies(); // Fetch all liked movies
    }
  }, [view]); // Run effect when view changes

  const fetchMovies = async (query) => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${query}&apikey=f056c034`
      );
      const fetchData = await response.json();
      if (fetchData.Search) {
        setData(fetchData.Search);
        setLatestMovies(fetchData.Search);
        setLastSearchMovies(fetchData.Search); // Store for VISITED view
      }
    } catch (error) {
      console.error("ERROR FETCHING DATA:", error);
    }
  };

  const fetchAllLikedMovies = async () => {
    const allLikedIDs = Object.keys(likedMovies).filter((id) => likedMovies[id]);

    const moviePromises = allLikedIDs.map(async (id) => {
      const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=f056c034`);
      return res.json();
    });

    const likedMoviesData = await Promise.all(moviePromises);
    setData(likedMoviesData);
  };

  const toggleLike = (movieId) => {
    setLikedMovies((prevLikes) => {
      const updatedLikes = { ...prevLikes, [movieId]: !prevLikes[movieId] };
      localStorage.setItem("likedMovies", JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };

  const handleOptionClick = (option) => {
    setView(option);
  };

  return (
    <>
      <div className="header">
        <div className="logo">
          <h3>JETFLIX</h3>
        </div>
        <div className="search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => fetchMovies(search)}>
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="option">
        <h3 onClick={() => handleOptionClick("HOME")}>HOME</h3>
        <h3 onClick={() => handleOptionClick("VISITED")}>VISITED</h3>
        <h3 onClick={() => handleOptionClick("LIKED")}>FAVOURITE</h3>
      </div>

      <div className="movie">
        <div className="container">
          {data.map((curElm) => {
            const isLiked = likedMovies[curElm.imdbID] || false;
            return (
              <div className="box" key={curElm.imdbID}>
                <div className="img_box">
                  <img src={curElm.Poster} alt={curElm.Title} />
                </div>
                <div className="detail">
                  <h3>{curElm.Title}</h3>
                  <h4>Release date: {curElm.Year}</h4>
                  <button
                    className="like-btn"
                    onClick={() => toggleLike(curElm.imdbID)}
                  >
                    {isLiked ? (
                      <AiFillHeart color="tomato" size={24} />
                    ) : (
                      <AiOutlineHeart color="white" size={24} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Movie;
