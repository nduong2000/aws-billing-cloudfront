import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices, deleteService } from '../services/api';

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This may fail if it is associated with existing claim items.')) {
      try {
        setLoading(true);
        setError(null);
        await deleteService(serviceId);
        alert('Service deleted successfully!');
        fetchServices(); // Refresh list
      } catch (err) {
        console.error("Failed to delete service:", err);
        const message = err.response?.data?.message || 'Failed to delete service.';
        setError(`${message} Ensure the service is not used in any claims.`);
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>Services (CPT Codes)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/services/new">
          <button>Add New Service</button>
        </Link>
      </div>

      {loading && <p className="loading-message">Loading services...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>CPT Code</th>
              <th>Description</th>
              <th>Standard Charge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? (
              services.map((service) => (
                <tr key={service.service_id}>
                  <td>{service.cpt_code}</td>
                  <td>{service.description}</td>
                  <td>${service.standard_charge ? Number(service.standard_charge).toFixed(2) : 'N/A'}</td>
                  <td>
                    {/* No dedicated view page for service usually */}
                    <Link to={`/services/${service.service_id}/edit`}>Edit</Link> |
                    <button className="danger" onClick={() => handleDelete(service.service_id)} disabled={loading}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No services found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ServicesPage; 