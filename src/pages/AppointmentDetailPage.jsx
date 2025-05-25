import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Use your actual API service

function AppointmentDetailPage() {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get appointment ID from URL

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        // TODO: Ensure your API has an endpoint like /appointments/:id
        const response = await api.get(`/appointments/${id}`);
        setAppointment(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching appointment details:", err);
        setError('Failed to fetch appointment details. Please try again later.');
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]); // Re-run effect if ID changes

  if (loading) {
    return <div>Loading appointment details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!appointment) {
    return <div>Appointment not found.</div>;
  }

  // TODO: Display more appointment details as available from your API
  return (
    <div className="container">
      <h1>Appointment Details</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Appointment ID: {appointment.appointment_id}</h5>
          <p className="card-text"><strong>Patient ID:</strong> {appointment.patient_id} {/* Consider linking to patient */}</p>
          <p className="card-text"><strong>Provider ID:</strong> {appointment.provider_id} {/* Consider linking to provider */}</p>
          <p className="card-text"><strong>Date & Time:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
          <p className="card-text"><strong>Reason for Visit:</strong> {appointment.reason_for_visit || 'N/A'}</p>
          <p className="card-text"><strong>Status:</strong> {appointment.status || 'N/A'}</p>
           {/* Add link to edit appointment */}
          <Link to={`/appointments/${id}/edit`} className="btn btn-primary me-2">Edit</Link>
          <Link to="/appointments" className="btn btn-secondary">Back to Appointments</Link>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailPage; 