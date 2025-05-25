import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClaims, deleteClaim } from '../services/api';

function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Add state for filters (patient_id, provider_id, status)
  // const [filter, setFilter] = useState({});

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Pass filters to getClaims if implemented
      const data = await getClaims(); // Fetch all claims for now
      setClaims(data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
      setError('Failed to load claims. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // TODO: Add filter state to dependency array if implemented
  }, []);

  const handleDelete = async (claimId) => {
    if (window.confirm('Are you sure you want to delete this claim? This will also delete associated line items but will fail if payments exist.')) {
      try {
        setLoading(true);
        setError(null);
        await deleteClaim(claimId);
        alert('Claim deleted successfully!');
        fetchClaims(); // Refresh list
      } catch (err) {
        console.error("Failed to delete claim:", err);
        const message = err.response?.data?.message || 'Failed to delete claim.';
        setError(`${message} Ensure the claim has no associated payments.`);
        setLoading(false);
      }
    }
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    // Safely convert to number, default to 0 if invalid, then format
    return `$${(Number(amount) || 0).toFixed(2)}`;
  };

  return (
    <div>
      <h2>Claims</h2>
       {/* TODO: Add Filter components (dropdowns for patient, provider, status) */}

      <div style={{ marginBottom: '1rem' }}>
        <Link to="/claims/new">
          <button>Add New Claim</button>
        </Link>
      </div>

      {loading && <p className="loading-message">Loading claims...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Provider</th>
              <th>Total Charge</th>
              <th>Insurance Paid</th>
              <th>Patient Paid</th>
              <th>Status</th>
              <th>Fraud Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.length > 0 ? (
              claims.map((claim) => {
                const isFlagged = claim.fraud_score && parseFloat(claim.fraud_score) > 5;
                return (
                  <tr key={claim.claim_id} style={isFlagged ? { backgroundColor: '#fff3cd' } : {}}>
                    <td>{claim.claim_id}</td>
                    <td>{new Date(claim.claim_date).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/patients/${claim.patient_id}`}>
                        {claim.patient_name || `Patient #${claim.patient_id}`}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/providers/${claim.provider_id}`}>
                        {claim.provider_name || `Provider #${claim.provider_id}`}
                      </Link>
                    </td>
                    <td>{formatCurrency(claim.total_charge)}</td>
                    <td>{formatCurrency(claim.insurance_paid)}</td>
                    <td>{formatCurrency(claim.patient_paid)}</td>
                    <td>{claim.status}</td>
                    <td>{claim.fraud_score ? parseFloat(claim.fraud_score).toFixed(2) : 'N/A'}</td>
                    <td>
                      <Link to={`/claims/${claim.claim_id}`}>View</Link>{' '}
                      <Link to={`/claims/${claim.claim_id}/edit`}>Edit</Link>{' '}
                      <button 
                        className="danger" 
                        onClick={() => handleDelete(claim.claim_id)} 
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10">No claims found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClaimsPage;