import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, createPatient, updatePatient } from '../services/api';

function PatientFormPage() {
  const { id } = useParams(); // Get patient ID from URL if editing
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    address: '',
    phone_number: '',
    insurance_provider: '',
    insurance_policy_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchPatientData = async () => {
        setLoading(true);
        setError(null);
        try {
          const patient = await getPatient(id);
          // Format date for input type="date"
          const dob = patient.date_of_birth ? new Date(patient.date_of_birth).toISOString().split('T')[0] : '';
          setFormData({ ...patient, date_of_birth: dob });
        } catch (err) {
          console.error("Failed to fetch patient data:", err);
          setError('Failed to load patient data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchPatientData();
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

    try {
      if (isEditing) {
        await updatePatient(id, formData);
        alert('Patient updated successfully!');
      } else {
        await createPatient(formData);
        alert('Patient created successfully!');
      }
      navigate('/patients'); // Redirect back to the patient list
    } catch (err) {
      console.error("Failed to save patient:", err);
      // Attempt to get more specific error from backend if available
      const message = err.response?.data?.message || (isEditing ? 'Failed to update patient.' : 'Failed to create patient.');
      setError(`${message} Please check the details and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="date_of_birth">Date of Birth:</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
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
            <label htmlFor="insurance_provider">Insurance Provider:</label>
            <input
              type="text"
              id="insurance_provider"
              name="insurance_provider"
              value={formData.insurance_provider || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="insurance_policy_number">Insurance Policy Number:</label>
            <input
              type="text"
              id="insurance_policy_number"
              name="insurance_policy_number"
              value={formData.insurance_policy_number || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Patient' : 'Create Patient')}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/patients')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PatientFormPage; 