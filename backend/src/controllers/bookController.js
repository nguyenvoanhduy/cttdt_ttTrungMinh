import Book from "../models/Book.js";

// CREATE
export const createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};