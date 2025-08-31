import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noteService } from '../services/api';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  const [editingNote, setEditingNote] = useState({
    _id: '',
    title: '',
    content: ''
  });
  const [viewingNote, setViewingNote] = useState(null);
  const [showNoteDetailModal, setShowNoteDetailModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const notesData = await noteService.getAllNotes();
      setNotes(notesData);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!newNote.title || !newNote.content) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const createdNote = await noteService.createNote(newNote);
      setNotes([...notes, createdNote]);
      setNewNote({ title: '', content: '' });
      setShowNewNoteModal(false);
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    }
  };
  
  const handleOpenEditModal = (note) => {
    setEditingNote({
      _id: note._id,
      title: note.title,
      content: note.content
    });
    setShowEditNoteModal(true);
  };
  
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    if (!editingNote.title || !editingNote.content) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      const updatedNote = await noteService.updateNote(editingNote._id, {
        title: editingNote.title,
        content: editingNote.content
      });
      
      // Update the notes array with the updated note
      setNotes(notes.map(note => 
        note._id === editingNote._id ? updatedNote : note
      ));
      
      setShowEditNoteModal(false);
      setSuccess('Note updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to update note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setError('');
      await noteService.deleteNote(noteId);
      setNotes(notes.filter(note => note._id !== noteId));
      setSuccess('Note deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo size={32} />
            <h1 className="ml-2 text-xl font-bold text-gray-800">HD Notes</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="ml-2 font-medium text-gray-700">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="opacity-90">{user?.email || 'user@example.com'}</p>
              </div>
              {user?.googleId && (
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700">
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google Account
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm font-medium mb-1">Today's Date</p>
                <p className="text-lg font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-2xl font-bold mb-4 sm:mb-0">My Notes</h3>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="btn-primary flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Note
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-12 h-12 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-gray-800 mb-2">No notes yet</h4>
            <p className="text-gray-600 mb-4">Create your first note to get started!</p>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div 
                key={note._id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => {
                  setViewingNote(note);
                  setShowNoteDetailModal(true);
                }}
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{note.title}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(note);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit note"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete note"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 line-clamp-3">{note.content}</p>
                </div>
                <div className="px-4 pb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(note);
                    }}
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    Edit Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Create New Note</h3>
              <button
                type="button"
                onClick={() => setShowNewNoteModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="input-field"
                  placeholder="Enter a descriptive title"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="input-field min-h-[150px] resize-none"
                  placeholder="Write your note content here..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Note Modal */}
      {showEditNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Note</h3>
              <button
                type="button"
                onClick={() => setShowEditNoteModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                  className="input-field"
                  placeholder="Enter a descriptive title"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                  className="input-field min-h-[150px] resize-none"
                  placeholder="Write your note content here..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditNoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Note Detail View Modal */}
      {showNoteDetailModal && viewingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{viewingNote.title}</h3>
              <button
                type="button"
                onClick={() => setShowNoteDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 text-sm text-gray-500">
              Created: {new Date(viewingNote.createdAt).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {viewingNote.updatedAt !== viewingNote.createdAt && (
                <span className="ml-2">
                  (Updated: {new Date(viewingNote.updatedAt).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })})
                </span>
              )}
            </div>
            
            <div className="border-t border-b border-gray-100 py-4 mb-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{viewingNote.content}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNoteDetailModal(false);
                  handleOpenEditModal(viewingNote);
                }}
                className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
              >
                <PencilSquareIcon className="h-5 w-5 mr-1.5" />
                Edit Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoteDetailModal(false);
                  handleDeleteNote(viewingNote._id);
                }}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-1.5" />
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
