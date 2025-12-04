import Temple from "../models/Temple.js";

// CREATE
export const createTemple = async (req, res) => {
  try {
    const temple = new Temple(req.body);
    await temple.save();
    res.status(201).json(temple);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getTemples = async (req, res) => {
  try {
    const temples = await Temple.find();
    res.json(temples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(temple);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(temple);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.id);
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};