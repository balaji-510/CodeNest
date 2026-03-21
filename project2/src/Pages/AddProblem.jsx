import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import api from '../services/api';
import '../styles1/AddProblem.css';

function AddProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    topic: '',
    platform: 'CodeNest',
    url: '',
    leetcode_url: '',
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    starter_code: {
      python: '',
      javascript: '',
      java: '',
      cpp: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarterCodeChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      starter_code: { ...prev.starter_code, [language]: value }
    }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleExampleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const removeConstraint = (index) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const handleConstraintChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.map((c, i) => i === index ? value : c)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data
      const problemData = {
        ...formData,
        examples: JSON.stringify(formData.examples.filter(ex => ex.input || ex.output)),
        constraints: JSON.stringify(formData.constraints.filter(c => c.trim())),
        starter_code: JSON.stringify(formData.starter_code)
      };

      await api.post('/problems/', problemData);
      
      setSuccess('Problem added successfully!');
      setTimeout(() => {
        navigate('/problems');
      }, 2000);
    } catch (err) {
      console.error('Error adding problem:', err);
      setError(err.response?.data?.message || 'Failed to add problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-problem-page">
      <Navbar />
      <div className="add-problem-container">
        <div className="add-problem-header">
          <h1>Add New Problem</h1>
          <p>Create a new coding problem for students to solve</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅ {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-problem-form glass-effect">
          {/* Basic Information */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Problem Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Two Sum"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty *</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="topic">Topic *</label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Arrays, Strings, DP"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="platform">Platform</label>
                <input
                  type="text"
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="e.g., LeetCode, CodeNest"
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">Problem URL</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="leetcode_url">LeetCode URL (if applicable)</label>
              <input
                type="url"
                id="leetcode_url"
                name="leetcode_url"
                value={formData.leetcode_url}
                onChange={handleChange}
                placeholder="https://leetcode.com/problems/..."
              />
            </div>
          </section>

          {/* Description */}
          <section className="form-section">
            <h2>Problem Description *</h2>
            <div className="form-group">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the problem in detail..."
                rows="8"
                required
              />
              <small>Supports markdown formatting</small>
            </div>
          </section>

          {/* Examples */}
          <section className="form-section">
            <h2>Examples</h2>
            {formData.examples.map((example, index) => (
              <div key={index} className="example-group glass-effect">
                <div className="example-header">
                  <h3>Example {index + 1}</h3>
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Input</label>
                  <input
                    type="text"
                    value={example.input}
                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                    placeholder='e.g., nums = [2,7,11,15], target = 9'
                  />
                </div>

                <div className="form-group">
                  <label>Output</label>
                  <input
                    type="text"
                    value={example.output}
                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                    placeholder='e.g., [0,1]'
                  />
                </div>

                <div className="form-group">
                  <label>Explanation (optional)</label>
                  <input
                    type="text"
                    value={example.explanation}
                    onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                    placeholder='Explain why this is the output'
                  />
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addExample} className="btn-add">
              + Add Example
            </button>
          </section>

          {/* Constraints */}
          <section className="form-section">
            <h2>Constraints</h2>
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="constraint-group">
                <input
                  type="text"
                  value={constraint}
                  onChange={(e) => handleConstraintChange(index, e.target.value)}
                  placeholder='e.g., 1 <= nums.length <= 10^4'
                />
                {formData.constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="btn-remove-small"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button type="button" onClick={addConstraint} className="btn-add">
              + Add Constraint
            </button>
          </section>

          {/* Starter Code */}
          <section className="form-section">
            <h2>Starter Code (Optional)</h2>
            <p className="section-description">Provide template code for different languages</p>
            
            <div className="starter-code-tabs">
              <div className="form-group">
                <label>Python</label>
                <textarea
                  value={formData.starter_code.python}
                  onChange={(e) => handleStarterCodeChange('python', e.target.value)}
                  placeholder="def solution():\n    # Write your code here\n    pass"
                  rows="6"
                  className="code-textarea"
                />
              </div>

              <div className="form-group">
                <label>JavaScript</label>
                <textarea
                  value={formData.starter_code.javascript}
                  onChange={(e) => handleStarterCodeChange('javascript', e.target.value)}
                  placeholder="function solution() {\n    // Write your code here\n}"
                  rows="6"
                  className="code-textarea"
                />
              </div>

              <div className="form-group">
                <label>Java</label>
                <textarea
                  value={formData.starter_code.java}
                  onChange={(e) => handleStarterCodeChange('java', e.target.value)}
                  placeholder="class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}"
                  rows="6"
                  className="code-textarea"
                />
              </div>

              <div className="form-group">
                <label>C++</label>
                <textarea
                  value={formData.starter_code.cpp}
                  onChange={(e) => handleStarterCodeChange('cpp', e.target.value)}
                  placeholder="class Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};"
                  rows="6"
                  className="code-textarea"
                />
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/problems')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Problem...' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default AddProblem;
