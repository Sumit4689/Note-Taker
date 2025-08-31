const asyncHandler = require('express-async-handler');
const Note = require('../models/noteModel');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user.id });
    res.status(200).json(notes);
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        res.status(400);
        throw new Error("Title and content fields are required");
    }
    
    const note = await Note.create({
        title,
        content,
        user: req.user.id
    });
    
    res.status(201).json(note);
});

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }
    
    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to access this note");
    }
    
    res.status(200).json(note);
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }
    
    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to update this note");
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    
    res.status(200).json(updatedNote);
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
        res.status(404);
        throw new Error("Note not found");
    }
    
    // Check if note belongs to user
    if (note.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to delete this note");
    }
    
    await Note.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: "Note deleted successfully" });
});

module.exports = {
    getNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote
};
