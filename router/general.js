const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// 1. Obtain all the keys for the 'books' object.
const bookKeys = Object.keys(books);

// Route for user registration
public_users.post("/register", function (req, res) {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add new user to the database
  users.push({ username, password });

  // Optionally, return the updated list of users
  return res
    .status(201)
    .json({ message: "User registered successfully", users });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const bookList = Object.values(books);
  return res.status(200).json(bookList);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // Retrieve the ISBN from request parameters
  const isbn = req.params.isbn;
  const matchingBooks = [];

  for (const key of bookKeys) {
    if (books[key].isbn === isbn) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found for the provided isbn" });
  }

  return res.status(200).json(matchingBooks);
});

// 2. Iterate through the 'books' array & check if the author matches the one provided in the request parameters.
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (const key of bookKeys) {
    if (books[key].author === author) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found for the provided author" });
  }

  return res.status(200).json(matchingBooks);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (const key of bookKeys) {
    if (books[key].title === title) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length === 0) {
    return res
      .status(404)
      .json({ message: "No books found for the provided title" });
  }

  return res.status(200).json(matchingBooks);
});

// Get book review based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  // Iterate through books object to find book with matching ISBN
  for (const key in books) {
    if (books[key].isbn === isbn) {
      // If matching book found, return its reviews
      return res.status(200).json(books[key].reviews);
    }
  }

  // If no book with matching ISBN found, return 404 Not Found
  return res
    .status(404)
    .json({ message: "No book found with the provided ISBN" });
});

module.exports.general = public_users;
