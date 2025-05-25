import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProviders, deleteProvider } from '../services/api';

function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProviders();
      setProviders(data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setError('Failed to load providers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleDelete = async (providerId) => {
    if (window.confirm('Are you sure you want to delete this provider? This may fail if they have associated appointments or claims.')) {
      try {
        setLoading(true);
        setError(null);
        await deleteProvider(providerId);
        alert('Provider deleted successfully!');
        fetchProviders(); // Refresh list
      } catch (err) {
        console.error("Failed to delete provider:", err);
        const message = err.response?.data?.message || 'Failed to delete provider.';
        setError(`${message} Ensure the provider has no associated records.`);
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>Providers</h2>

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/providers/new">
          <button>Add New Provider</button>
        </Link>
      </div>

      {loading && <p className="loading-message">Loading providers...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>NPI Number</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.length > 0 ? (
              providers.map((provider) => (
                <tr key={provider.provider_id}>
                  <td>{provider.provider_name}</td>
                  <td>{provider.npi_number}</td>
                  <td>{provider.specialty || 'N/A'}</td>
                  <td>{provider.phone_number || 'N/A'}</td>
                  <td>{provider.address || 'N/A'}</td>
                  <td>
                    <Link to={`/providers/${provider.provider_id}`}>View</Link> |
                    <Link to={`/providers/${provider.provider_id}/edit`}>Edit</Link> |
                    <button className="danger" onClick={() => handleDelete(provider.provider_id)} disabled={loading}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No providers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProvidersPage; 