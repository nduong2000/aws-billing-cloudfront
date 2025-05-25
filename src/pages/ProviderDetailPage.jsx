import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProvider, getAppointments, getClaims } from '../services/api';

function ProviderDetailPage() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch provider, appointments, and claims in parallel
        const [providerData, appointmentsData, claimsData] = await Promise.all([
          getProvider(id),
          getAppointments({ provider_id: id }), // Filter appointments by provider
          getClaims({ provider_id: id })        // Filter claims by provider
        ]);

        setProvider(providerData);
        setAppointments(appointmentsData);
        setClaims(claimsData);

      } catch (err) {
        console.error("Failed to fetch provider details:", err);
        setError('Failed to load provider details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  if (loading) return <p className="loading-message">Loading provider details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!provider) return <p>Provider not found.</p>;

  return (
    <div>
      <h2>Provider Details: {provider.provider_name}</h2>
      <Link to={`/providers/${id}/edit`}><button>Edit Provider</button></Link>
      <hr />

      <h3>Information</h3>
      <p><strong>NPI Number:</strong> {provider.npi_number}</p>
      <p><strong>Specialty:</strong> {provider.specialty || 'N/A'}</p>
      <p><strong>Address:</strong> {provider.address || 'N/A'}</p>
      <p><strong>Phone:</strong> {provider.phone_number || 'N/A'}</p>

      <hr />

       <h3>Appointments</h3>
      {appointments.length > 0 ? (
          <table>
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Reason</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {appointments.map(appt => (
                      <tr key={appt.appointment_id}>
                          <td>{new Date(appt.appointment_date).toLocaleString()}</td>
                           {/* Link to patient detail page if available */}
                          <td><Link to={`/patients/${appt.patient_id}`}>{appt.first_name} {appt.last_name}</Link></td>
                          <td>{appt.reason_for_visit || 'N/A'}</td>
                          <td><Link to={`/appointments/${appt.appointment_id}`}>View</Link></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      ) : <p>No appointments found for this provider.</p>}
       {/* TODO: Link to add new appointment for this provider? */}

      <hr />

      <h3>Claims</h3>
       {claims.length > 0 ? (
          <table>
              <thead>
                  <tr>
                      <th>Claim Date</th>
                      <th>Patient</th>
                      <th>Total Charge</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {claims.map(claim => (
                      <tr key={claim.claim_id}>
                          <td>{new Date(claim.claim_date).toLocaleDateString()}</td>
                          <td><Link to={`/patients/${claim.patient_id}`}>{claim.first_name} {claim.last_name}</Link></td>
                          <td>${(Number(claim.total_charge) || 0).toFixed(2)}</td>
                          <td>{claim.status}</td>
                           <td><Link to={`/claims/${claim.claim_id}`}>View</Link></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      ) : <p>No claims found for this provider.</p>}
        {/* TODO: Link to add new claim for this provider? */}

    </div>
  );
}

export default ProviderDetailPage; 