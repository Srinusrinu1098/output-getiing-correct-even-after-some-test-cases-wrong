const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error :${e.message}`);
    process.exit(1);
  }
};
initializeDbToServer();

app.get("/movies/", async (request, response) => {
  const getDbDetails = `
    SELECT
    movie_name
    FROM
    movie;`;
  const dbResponse = await db.all(getDbDetails);
  response.send(dbResponse);
});

//post

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const getDbQuery = `
    INSERT INTO 
    movie 
    (
        director_id,
        movie_name,
        lead_actor
    )
    VALUES 
    (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;

  const dbResponse = await db.run(getDbQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

// get single movie_id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getSingleMovie = `
    SELECT 
    *
FROM 
    movie
WHERE 
    movie_id = ${movieId};`;

  const dbResponse = await db.get(getSingleMovie);
  response.send(dbResponse);
});

// update

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const UpdateSql = `
    UPDATE 
    movie
    SET 
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor ='${leadActor}'
     WHERE 
     movie_id = ${movieId};`;

  await db.run(UpdateSql);
  response.send("Movie Details Updated");
});

// delete

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteFromSql = `
    DELETE 
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};`;
  await db.run(deleteFromSql);
  response.send("Movie Removed");
});

// get method from directors

app.get("/directors/", async (request, response) => {
  const getDbDetails = `
    SELECT
    *
    FROM
    director;`;
  const dbResponse = await db.all(getDbDetails);
  response.send(dbResponse);
});

// get method from directors of all movies

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDbDetails = `
    SELECT
    movie_name
    FROM
    movie 
    WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(getDbDetails);
  response.send(dbResponse);
});

module.exports = app;
