import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatient, getAppointments, getClaims } from '../services/api'; // Add appointment/claim fetching

function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch patient, appointments, and claims in parallel
        const [patientData, appointmentsData, claimsData] = await Promise.all([
          getPatient(id),
          getAppointments({ patient_id: id }), // Assuming API supports filtering
          getClaims({ patient_id: id })        // Assuming API supports filtering
        ]);

        setPatient(patientData);
        setAppointments(appointmentsData);
        setClaims(claimsData);

      } catch (err) {
        console.error("Failed to fetch patient details:", err);
        setError('Failed to load patient details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  if (loading) return <p className="loading-message">Loading patient details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!patient) return <p>Patient not found.</p>; // Should ideally not happen if error handling is correct

  return (
    <div>
      <h2>Patient Details: {patient.first_name} {patient.last_name}</h2>
      <Link to={`/patients/${id}/edit`}><button>Edit Patient</button></Link>
      <hr />

      <h3>Demographics</h3>
      <p><strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
      <p><strong>Address:</strong> {patient.address || 'N/A'}</p>
      <p><strong>Phone:</strong> {patient.phone_number || 'N/A'}</p>

      <h3>Insurance Information</h3>
      <p><strong>Provider:</strong> {patient.insurance_provider || 'N/A'}</p>
      <p><strong>Policy Number:</strong> {patient.insurance_policy_number || 'N/A'}</p>

      <hr />

      <h3>Appointments</h3>
      {appointments.length > 0 ? (
          <table>
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Provider</th>
                      <th>Reason</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {appointments.map(appt => (
                      <tr key={appt.appointment_id}>
                          <td>{new Date(appt.appointment_date).toLocaleString()}</td>
                          <td>{appt.provider_name || `ID: ${appt.provider_id}`}</td>
                          <td>{appt.reason_for_visit || 'N/A'}</td>
                          <td><Link to={`/appointments/${appt.appointment_id}`}>View</Link></td> {/* Assuming appointment detail page */} 
                      </tr>
                  ))}
              </tbody>
          </table>
      ) : <p>No appointments found for this patient.</p>}
      {/* TODO: Link to add new appointment for this patient */}

       <hr />

      <h3>Claims</h3>
       {claims.length > 0 ? (
          <table>
              <thead>
                  <tr>
                      <th>Claim Date</th>
                      <th>Provider</th>
                      <th>Total Charge</th>
                      <th>Amount Paid</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {claims.map(claim => (
                      <tr key={claim.claim_id}>
                          <td>{new Date(claim.claim_date).toLocaleDateString()}</td>
                          <td>{claim.provider_name || `ID: ${claim.provider_id}`}</td>
                          <td>${(Number(claim.total_charge) || 0).toFixed(2)}</td>
                          <td>${(Number(claim.insurance_paid) || 0 + Number(claim.patient_paid) || 0).toFixed(2)}</td>
                          <td>{claim.status}</td>
                           <td><Link to={`/claims/${claim.claim_id}`}>View</Link></td> {/* Assuming claim detail page */} 
                      </tr>
                  ))}
              </tbody>
          </table>
      ) : <p>No claims found for this patient.</p>}
       {/* TODO: Link to add new claim for this patient */}

    </div>
  );
}

export default PatientDetailPage; 