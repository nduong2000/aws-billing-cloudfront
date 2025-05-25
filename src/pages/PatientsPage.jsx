import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getPatients, deletePatient } from '../services/api'; // Import deletePatient

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  // Function to fetch patients (could be memoized with useCallback)
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []); // Empty dependency array means this runs once on mount

  const handleDelete = async (patientId) => {
      if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
          try {
              setLoading(true); // Indicate loading state during deletion
              setError(null);
              await deletePatient(patientId);
              alert('Patient deleted successfully!');
              // Refresh the list after deletion
              fetchPatients(); // Re-fetch patients
              // Or filter out the deleted patient from the current state:
              // setPatients(prevPatients => prevPatients.filter(p => p.patient_id !== patientId));
          } catch (err) {
              console.error("Failed to delete patient:", err);
              const message = err.response?.data?.message || 'Failed to delete patient.';
              setError(`${message} Check if the patient has associated records (claims, appointments).`);
              setLoading(false); // Stop loading indicator on error
          }
          // No finally block needed here for setLoading, as fetchPatients sets it
      }
  };

  return (
    <div>
      <h2>Patients</h2>

      <div style={{ marginBottom: '1rem' }}> {/* Add some spacing */}
        <Link to="/patients/new">
            <button>Add New Patient</button>
        </Link>
      </div>

      {loading && <p className="loading-message">Loading patients...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Phone</th>
              <th>Insurance Provider</th>
              <th>Policy Number</th>
              <th>Actions</th> { /* Placeholder for View/Edit/Delete buttons */}
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>{patient.first_name} {patient.last_name}</td>
                  <td>{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                  <td>{patient.phone_number || 'N/A'}</td>
                  <td>{patient.insurance_provider || 'N/A'}</td>
                  <td>{patient.insurance_policy_number || 'N/A'}</td>
                  <td>
                    <Link to={`/patients/${patient.patient_id}`}>View</Link> |
                    <Link to={`/patients/${patient.patient_id}/edit`}>Edit</Link> |
                    <button className="danger" onClick={() => handleDelete(patient.patient_id)} disabled={loading}>
                        Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientsPage; 