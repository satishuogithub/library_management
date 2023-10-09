const express = require('express');

const app = express();

//app.use(express.json());

const path = require('path');

const sqlite3 = require('sqlite3');

const { open } = require ('sqlite');

const port = 3000;



app.get('/', (request, response) =>{
    response.send('all Okay');
})

let date = new Date();

app.get('/date', (request, response) => {
    response.send(date);
})
const dbPath = path.join(__dirname, 'bookpractice.db');
let db = null;
const initializeDbAndServer = async () =>{
    try{
    db = await open({
        filename: dbPath,
        driver : sqlite3.Database
    });
    app.listen(3000, () => {
        console.log(`Server is listening at port : ${port}`);
    });
    } catch(e){
        console.log(`server error: ${ e.message }`);
    }
}
initializeDbAndServer();
//get books
app.get('/books/', async(request, response) =>{
        const getBooksQuery =`
            SELECT 
             * 
            FROM
             book
            ORDER BY
            book_id ;
        `;
        const booksArray = await db.all(getBooksQuery);
        response.send(booksArray);
});

//get single book
app.get('/books/:bookId/', async (request, response) =>{
    const {bookId} = request.params;
    const getBookQuery = `SELECT
                      *
                    FROM 
                    book
                    WHERE 
                    book_id = ${ bookId };`;
    const book = await db.get(getBookQuery);
    response.send( book );
});

//post book
app.post("/addbook/", async (request, response) => {
    
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
        book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
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
  });
  //update book
  app.put("/books/:bookId/", async (request, response) => {
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
  });
  server1.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;
    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        book_id = ${bookId};`;
    await db.run(deleteBookQuery);
    response.send("Book Deleted Successfully");
  });
//registeration
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
//login authentication
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
