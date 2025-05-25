import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAppointment,
  createAppointment,
  updateAppointment,
  getPatients, // Need to fetch patients for dropdown
  getProviders // Need to fetch providers for dropdown
} from '../services/api';

function AppointmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    patient_id: '',
    provider_id: '',
    appointment_date: '', // Store as YYYY-MM-DDTHH:mm
    reason_for_visit: ''
  });
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingLists, setLoadingLists] = useState(true); // Separate loading for dropdowns

  // Fetch patients and providers for dropdowns
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const [patientsData, providersData] = await Promise.all([
          getPatients(),
          getProviders()
        ]);
        setPatients(patientsData);
        setProviders(providersData);
      } catch (err) {
        console.error("Failed to fetch patient/provider lists:", err);
        setError('Failed to load patient and provider lists. Cannot add/edit appointments.');
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  // Fetch appointment data if editing
  useEffect(() => {
    if (isEditing && !loadingLists) { // Fetch only if editing and lists are loaded
      const fetchAppointmentData = async () => {
        setLoading(true);
        setError(null);
        try {
          const appointment = await getAppointment(id);
          // Format date for input type="datetime-local"
          // Requires YYYY-MM-DDTHH:mm format
          const apptDate = appointment.appointment_date
            ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
            : '';
          setFormData({ 
            patient_id: appointment.patient_id.toString(),
            provider_id: appointment.provider_id.toString(),
            appointment_date: apptDate,
            reason_for_visit: appointment.reason_for_visit || ''
          });
        } catch (err) {
          console.error("Failed to fetch appointment data:", err);
          setError('Failed to load appointment data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchAppointmentData();
    }
  }, [id, isEditing, loadingLists]); // Re-run if lists finish loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation
    if (!formData.patient_id || !formData.provider_id || !formData.appointment_date) {
        setError('Patient, Provider, and Appointment Date are required.');
        setLoading(false);
        return;
    }

    // Convert local datetime string back to a format the backend expects
    const dataToSend = {
        ...formData,
        patient_id: parseInt(formData.patient_id, 10),
        provider_id: parseInt(formData.provider_id, 10),
        appointment_date: new Date(formData.appointment_date).toISOString()
    };

    try {
      if (isEditing) {
        await updateAppointment(id, dataToSend);
        alert('Appointment updated successfully!');
      } else {
        await createAppointment(dataToSend);
        alert('Appointment created successfully!');
      }
      navigate('/appointments'); // Redirect back to the appointment list
    } catch (err) {
      console.error("Failed to save appointment:", err);
      const message = err.response?.data?.message || (isEditing ? 'Failed to update appointment.' : 'Failed to create appointment.');
      setError(`${message} Please check the details and try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingLists) {
      return <p className="loading-message">Loading patient/provider lists...</p>;
  }

  return (
    <div>
      <h2>{isEditing ? 'Edit Appointment' : 'Add New Appointment'}</h2>

      {/* Show form loading/error only after lists are loaded */} 
      {loading && <p className="loading-message">Loading appointment data...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="patient_id">Patient:</label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.last_name}, {p.first_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="provider_id">Provider:</label>
            <select
              id="provider_id"
              name="provider_id"
              value={formData.provider_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Provider --</option>
              {providers.map(p => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name || `${p.first_name} ${p.last_name}`} ({p.specialty || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="appointment_date">Date & Time:</label>
            <input
              type="datetime-local"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
            />
          </div>

           <div>
            <label htmlFor="reason_for_visit">Reason for Visit:</label>
            <textarea
              id="reason_for_visit"
              name="reason_for_visit"
              rows="3"
              value={formData.reason_for_visit || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <button type="submit" disabled={loading || loadingLists}>
              {loading ? 'Saving...' : (isEditing ? 'Update Appointment' : 'Create Appointment')}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/appointments')} disabled={loading || loadingLists}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AppointmentFormPage; 