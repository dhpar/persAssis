import React, { useState, useEffect } from 'react';
import {
  getPrompts,
  savePrompt,
  updatePrompt,
  deletePrompt,
  activatePrompt,
  IPrompt,
  IPromptCreate
} from '../services/api';

type ViewMode = 'list' | 'create' | 'edit';

export default function PromptsManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [prompts, setPrompts] = useState<IPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<IPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<IPromptCreate>({
    title: '',
    content: '',
    type: '',
    tags: '',
    is_active: false,
  });

  // Fetch prompts on mount and when filter changes
  useEffect(() => {
    loadPrompts();
  }, [filterType]);

  const loadPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrompts(filterType || undefined);
      setPrompts(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: '',
      tags: '',
      is_active: false,
    });
    setSelectedPrompt(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = async (prompt: IPrompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      type: prompt.type,
      tags: prompt.tags,
      is_active: prompt.is_active,
    });
    setViewMode('edit');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deletePrompt(id);
      setSuccessMessage('Prompt deleted successfully');
      await loadPrompts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await activatePrompt(id);
      setSuccessMessage('Prompt activated successfully');
      await loadPrompts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (viewMode === 'create') {
        await savePrompt(formData);
        setSuccessMessage('Prompt created successfully');
      } else if (viewMode === 'edit' && selectedPrompt) {
        await updatePrompt(selectedPrompt.id, formData);
        setSuccessMessage('Prompt updated successfully');
      }
      resetForm();
      setViewMode('list');
      await loadPrompts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prompt Manager</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        {viewMode === 'list' ? (
          <div>
            {/* Filters and Controls */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="reasoner_system">Reasoner System</option>
                  <option value="verifier_system">Verifier System</option>
                  <option value="correction_feedback">Correction Feedback</option>
                </select>
              </div>
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                + New Prompt
              </button>
            </div>

            {/* Prompts List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading && !prompts.length ? (
                <div className="p-8 text-center text-gray-500">Loading prompts...</div>
              ) : prompts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No prompts found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prompts.map((prompt) => (
                      <tr key={prompt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {prompt.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{prompt.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{prompt.version}</td>
                        <td className="px-6 py-4 text-sm">
                          {prompt.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(prompt)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          {!prompt.is_active && (
                            <button
                              onClick={() => handleActivate(prompt.id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* Create/Edit Form */
          <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {viewMode === 'create' ? 'Create New Prompt' : 'Edit Prompt'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a type</option>
                  <option value="reasoner_system">Reasoner System</option>
                  <option value="verifier_system">Verifier System</option>
                  <option value="correction_feedback">Correction Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter the prompt content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., tag1, tag2, tag3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Activate this prompt (will deactivate others of same type)
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Prompt'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
