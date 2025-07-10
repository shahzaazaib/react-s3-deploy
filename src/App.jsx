import React, { useState, useEffect } from 'react';
import { Star, Upload, X, Edit, Trash2, Search, Filter, Plus, AlertCircle, CheckCircle, XCircle, Flag, Check, Ban, Clock } from 'lucide-react';

const PottdFeedbackApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [feedback, setFeedback] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    rating: 0,
    feedback: '',
    images: []
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // API endpoints
  const API_BASE_URL = 'https://d9ymirkmrc.execute-api.eu-west-2.amazonaws.com/prod';
  const API_KEY = 'fg2jFUkB3Q4lvrLwlGLmja5uoTE5422HaQ9nFRgE';
  const endpoints = {
    submit: `${API_BASE_URL}/submit`,
    fetch: `${API_BASE_URL}/fetch`,
    admin: `${API_BASE_URL}/admin`,
    update: `${API_BASE_URL}/put`,
    delete: `${API_BASE_URL}/delete`
  };

  const categories = ['Product Quality', 'User Experience', 'Customer Service', 'Shipping', 'Website', 'General'];

  // Notification system
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch feedback data from API
  const fetchFeedback = async () => {
    setFetchingData(true);
    try {
      const response = await fetch(endpoints.fetch, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(Array.isArray(data) ? data : data.feedback || []);
      } else {
        showNotification('error', 'Failed to fetch feedback data');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showNotification('error', 'Error connecting to server');
    } finally {
      setFetchingData(false);
    }
  };

  // Load feedback on component mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.category || !formData.rating || !formData.feedback) {
        showNotification('error', 'Please fill in all required fields');
        setLoading(false);
        return;
      }

      const submitData = {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        rating: formData.rating,
        feedback: formData.feedback,
        uploadImages: formData.images || []
      };

      if (editingId) {
        // Update existing feedback
        const response = await fetch(endpoints.update, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({
            id: editingId,
            ...submitData
          }),
        });

        if (response.ok) {
          showNotification('success', 'Feedback updated successfully!');
          setEditingId(null);
          await fetchFeedback(); // Refresh the data
        } else {
          showNotification('error', 'Failed to update feedback');
        }
      } else {
        // Submit new feedback
        const response = await fetch(endpoints.submit, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          showNotification('success', 'Feedback submitted successfully!');
          await fetchFeedback(); // Refresh the data
        } else {
          showNotification('error', 'Failed to submit feedback');
        }
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        category: '',
        rating: 0,
        feedback: '',
        images: []
      });
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification('error', 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin actions (approve, reject, flag)
  const handleAdminAction = async (feedbackId, action) => {
    try {
      const response = await fetch(endpoints.admin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          id: feedbackId,
          action: action
        }),
      });

      if (response.ok) {
        const actionMessages = {
          approve: 'Feedback approved successfully!',
          reject: 'Feedback rejected successfully!',
          flag: 'Feedback flagged for review!'
        };
        showNotification('success', actionMessages[action]);
        await fetchFeedback(); // Refresh the data
      } else {
        showNotification('error', `Failed to ${action} feedback`);
      }
    } catch (error) {
      console.error(`Error ${action}ing feedback:`, error);
      showNotification('error', 'Error connecting to server');
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  // Remove image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Edit feedback
  const editFeedback = (item) => {
    setFormData({
      name: item.name,
      email: item.email,
      category: item.category,
      rating: item.rating,
      feedback: item.feedback,
      images: item.images || []
    });
    setEditingId(item.id);
    setActiveTab('submit');
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const response = await fetch(endpoints.delete, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          showNotification('success', 'Feedback deleted successfully!');
          await fetchFeedback(); // Refresh the data
        } else {
          showNotification('error', 'Failed to delete feedback');
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        showNotification('error', 'Error connecting to server');
      }
    }
  };

  // Filter feedback
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.feedback?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <Ban className="w-4 h-4" />;
      case 'flagged':
        return <Flag className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Rating component
  const StarRating = ({ rating, onRatingChange, readonly = false }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readonly && onRatingChange(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-purple-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pottd
                </h1>
                <p className="text-gray-600 text-sm">Community-driven crafting platform</p>
              </div>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'submit'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5" />}
          {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {editingId ? 'Edit Feedback' : 'Share Your Experience'}
                </h2>
                <p className="text-gray-600">
                  Help us improve by sharing your thoughts and suggestions
                </p>
              </div>

              <div className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <StarRating
                    rating={formData.rating}
                    onRatingChange={(rating) => setFormData({...formData, rating})}
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback *
                  </label>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Share your detailed feedback..."
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Click to upload images</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors"
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : editingId ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Feedback Dashboard</h2>
              <div className="flex space-x-4">
                <button
                  onClick={fetchFeedback}
                  disabled={fetchingData}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {fetchingData ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {fetchingData && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading feedback...</p>
              </div>
            )}

            {/* Feedback List */}
            {!fetchingData && (
              <div className="space-y-6">
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No feedback found</h3>
                    <p className="text-gray-500">
                      {feedback.length === 0 ? 'Be the first to share your experience!' : 'Try adjusting your filters'}
                    </p>
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusBadgeColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              <span className="capitalize">{item.status || 'pending'}</span>
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{item.email}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Admin Actions */}
                          <div className="flex items-center space-x-1 mr-2">
                            <button
                              onClick={() => handleAdminAction(item.id, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdminAction(item.id, 'reject')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdminAction(item.id, 'flag')}
                              className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                              title="Flag for Review"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Edit/Delete Actions */}
                          <button
                            onClick={() => editFeedback(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFeedback(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <StarRating rating={item.rating || 0} readonly />
                      </div>
                      
                      <p className="text-gray-700 mb-4">{item.feedback}</p>
                      
                      {item.images && item.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {item.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Feedback image ${index + 1}`}
                              className="w-full h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">Pottd</h3>
              </div>
                Empowering creativity through DIY craft kits and community engagement.
      
            </div>
      
        </div>
</div>
      </footer>
    </div>
  );
};

export default PottdFeedbackApp;
