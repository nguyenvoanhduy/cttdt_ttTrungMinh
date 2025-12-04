import Personal from "../models/Personal.js";

// CREATE
export const createPersonal = async (req, res) => {
  try {
    const person = new Personal(req.body);
    await person.save();
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getPersonals = async (req, res) => {
  try {
    const persons = await Personal.find();
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getPersonalById = async (req, res) => {
  try {
    const person = await Personal.findById(req.params.id);
    if (!person) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updatePersonal = async (req, res) => {
  try {
    const person = await Personal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!person) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deletePersonal = async (req, res) => {
  try {
    const person = await Personal.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};