//Here book is used instead of product

const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'bookpractice.db');
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is listening at port: ${port}`);
    });
  } catch (e) {
    console.log(`Server error: ${e.message}`);
  }
};

initializeDbAndServer();

//Gets list of all books with a JSON Web Token from data base

app.get('/books/', (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid Access Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token');
      } else {
        const getBooksQuery = `
            SELECT
              *
            FROM
             book
            ORDER BY
              book_id;`;
        const booksArray = await db.all(getBooksQuery);
        response.send(booksArray);
      }
    });
  }
});

//Gets single book details with a JSON Web Token from data base

app.get('/books/:bookId/', (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid Access Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token');
      } else {
        const { bookId } = request.params;
        const getBookQuery = `SELECT
                      *
                    FROM 
                    book
                    WHERE 
                    book_id = ${bookId};`;
        const book = await db.get(getBookQuery);
        response.send(book);
      }
    });
  }
});

// Posts book details  with a JSON Web Token 

app.post('/addbook/', (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid Access Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token');
      } else {
        const bookDetails = {
      
            book_id: 1,
            title: 'book10',
            author_id: 'author10',
            rating: 4.5,
            rating_Count: 10000,
            
          };
        
          
          const {
              book_id,
              title,
              author_id,
              rating,
              rating_Count,
          } = bookDetails;
        
          const addBookQuery = `
            INSERT INTO
              book (title,author_id,rating,rating_count)
            VALUES
              (
                 ${book_id},
                 '${title}',
                 ${author_id},
                 ${rating},
                 ${rating_Count},
                 
                
              );`;
        
          const dbResponse = await db.run(addBookQuery);
          const bookId = dbResponse.lastID;
        
          
          response.send({ bookId: bookId });
      }
    });
  }
});

// Update a book with a JSON Web Token 

app.put('/books/:bookId/', (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid Access Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token');
      } else {
        const { bookId } = request.params;
        const bookDetails = request.body;
        const {
            book_id,
            title,
            author_id,
            rating,
            rating_Count,
        } = bookDetails;
        const updateBookQuery = `
        UPDATE
            book
        SET
        ${book_id},
        '${title}',
        ${author_id},
        ${rating},
        ${rating_Count},
        WHERE
            book_id = ${bookId};`;
        await db.run(updateBookQuery);
        response.send("Book Updated Successfully");
      }
    });
  }
});

// Deletes a book with help of JSON WEB TOKEN
app.delete('/books/:bookId/', (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1];
  }
  if (jwtToken === undefined) {
    response.status(401).send('Invalid Access Token');
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.send('Invalid Access Token');
      } else {
        const { bookId } = request.params;
        const deleteBookQuery = `
        DELETE FROM
            book
        WHERE
            book_id = ${bookId};`;
        await db.run(deleteBookQuery);
        response.send("Book Deleted Successfully");
      }
    });
  }
});

///registeration - Hash code generated with bcrypt and stored in db
app.post("/users/", async (request, response) => {
    const { username, name, password, gender, location } = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          user (username, name, password, gender, location) 
        VALUES 
          (
            '${username}', 
            '${name}',
            '${hashedPassword}', 
            '${gender}',
            '${location}'
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
  });

//login -  here hashed password is compared with user password with bcrypt.compare

  app.post("/login", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched === true) {
        response.send("Login Success!");
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });
