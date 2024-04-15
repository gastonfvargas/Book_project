const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username);
  if (!user) {
    return false; 
  }
  return user.password === password;
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user.username; // Set authenticated user in request object
    next();
  });
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  }
  const token = jwt.sign({ username: username }, "your_secret_key");
  return res.status(200).json({ token: token });
});

regd_users.post("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query; // Extract review from query parameters
  const username = req.user;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  const book = books.find((book) => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const existingReviewIndex = book.reviews.findIndex(
    (r) => r.username === username
  );

  if (existingReviewIndex !== -1) {
    book.reviews[existingReviewIndex].review = review;
  } else {
    book.reviews.push({ username, review });
  }

  return res.status(200).json({ message: "Review posted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
