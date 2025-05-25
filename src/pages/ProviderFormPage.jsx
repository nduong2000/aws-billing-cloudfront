import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProvider, createProvider, updateProvider } from '../services/api';

function ProviderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    provider_name: '',
    npi_number: '',
    specialty: '',
    address: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchProviderData = async () => {
        setLoading(true);
        setError(null);
        try {
          const provider = await getProvider(id);
          setFormData(provider);
        } catch (err) {
          console.error("Failed to fetch provider data:", err);
          setError('Failed to load provider data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchProviderData();
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

    // Basic NPI validation (example - could be more complex)
    if (!formData.npi_number || formData.npi_number.length !== 10 || !/^[0-9]+$/.test(formData.npi_number)) {
        setError('NPI Number must be exactly 10 digits.');
        setLoading(false);
        return;
    }

    try {
      if (isEditing) {
        await updateProvider(id, formData);
        alert('Provider updated successfully!');
      } else {
        await createProvider(formData);
        alert('Provider created successfully!');
      }
      navigate('/providers'); // Redirect back to the provider list
    } catch (err) {
      console.error("Failed to save provider:", err);
      const message = err.response?.data?.message || (isEditing ? 'Failed to update provider.' : 'Failed to create provider.');
      setError(`${message} Please check the details and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Provider' : 'Add New Provider'}</h2>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="provider_name">Provider Name:</label>
            <input
              type="text"
              id="provider_name"
              name="provider_name"
              value={formData.provider_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="npi_number">NPI Number (10 digits):</label>
            <input
              type="text"
              id="npi_number"
              name="npi_number"
              value={formData.npi_number}
              onChange={handleChange}
              required
              maxLength="10"
              pattern="\d{10}" // HTML5 pattern validation
            />
          </div>
          <div>
            <label htmlFor="specialty">Specialty:</label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone_number">Phone Number:</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Provider' : 'Create Provider')}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/providers')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProviderFormPage; 