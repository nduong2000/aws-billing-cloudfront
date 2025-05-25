import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getService, createService, updateService } from '../services/api';

function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    cpt_code: '',
    description: '',
    standard_charge: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchServiceData = async () => {
        setLoading(true);
        setError(null);
        try {
          const service = await getService(id);
          // Ensure charge is formatted correctly for the input if needed (or handled by type="number")
          setFormData({
              ...service,
              standard_charge: service.standard_charge !== null ? Number(service.standard_charge) : ''
            });
        } catch (err) {
          console.error("Failed to fetch service data:", err);
          setError('Failed to load service data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchServiceData();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate standard_charge is a non-negative number
    const charge = parseFloat(formData.standard_charge);
    if (isNaN(charge) || charge < 0) {
        setError('Standard charge must be a valid non-negative number.');
        setLoading(false);
        return;
    }

    // Ensure charge is sent as a number
    const dataToSend = { ...formData, standard_charge: charge };

    try {
      if (isEditing) {
        await updateService(id, dataToSend);
        alert('Service updated successfully!');
      } else {
        await createService(dataToSend);
        alert('Service created successfully!');
      }
      navigate('/services'); // Redirect back to the service list
    } catch (err) {
      console.error("Failed to save service:", err);
      const message = err.response?.data?.message || (isEditing ? 'Failed to update service.' : 'Failed to create service.');
      setError(`${message} Please check the details (CPT code must be unique).`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Service' : 'Add New Service'}</h2>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="cpt_code">CPT Code:</label>
            <input
              type="text"
              id="cpt_code"
              name="cpt_code"
              value={formData.cpt_code}
              onChange={handleChange}
              required
              maxLength="5"
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="standard_charge">Standard Charge:</label>
            <input
              type="number"
              id="standard_charge"
              name="standard_charge"
              value={formData.standard_charge}
              onChange={handleChange}
              required
              step="0.01" // Allow cents
              min="0"      // Prevent negative numbers via HTML5 validation
            />
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/services')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ServiceFormPage; 