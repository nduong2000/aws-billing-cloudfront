import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ClaimDetailPage() {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/claims/${id}`);
        setClaim(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching claim details:", err);
        setError('Failed to fetch claim details. Please try again later.');
        setClaim(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  if (loading) {
    return <div>Loading claim details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!claim) {
    return <div>Claim not found.</div>;
  }

  // Helper to format currency
  const formatCurrency = (amount) => {
    return `$${(Number(amount) || 0).toFixed(2)}`;
  };

  return (
    <div className="container">
      <h1>Claim Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Claim ID: {claim.claim_id}</h5>
          <p className="card-text"><strong>Patient:</strong> {claim.patient_name}</p>
          <p className="card-text"><strong>Provider:</strong> {claim.provider_name}</p>
          <p className="card-text"><strong>Claim Date:</strong> {new Date(claim.claim_date).toLocaleDateString()}</p>
          <p className="card-text"><strong>Total Charge:</strong> {formatCurrency(claim.total_charge)}</p>
          <p className="card-text"><strong>Insurance Paid:</strong> {formatCurrency(claim.insurance_paid)}</p>
          <p className="card-text"><strong>Patient Paid:</strong> {formatCurrency(claim.patient_paid)}</p>
          <p className="card-text"><strong>Status:</strong> {claim.status}</p>
          {claim.fraud_score && (
            <p className="card-text">
              <strong>Fraud Score:</strong> {parseFloat(claim.fraud_score).toFixed(2)}
              {parseFloat(claim.fraud_score) > 5 && (
                <span className="badge bg-warning ms-2">Potential Fraud</span>
              )}
            </p>
          )}
          
          <div className="mt-3">
            <Link to={`/claims/${claim.claim_id}/edit`} className="btn btn-primary me-2">Edit Claim</Link>
            <Link to="/claims" className="btn btn-secondary">Back to Claims</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetailPage; 