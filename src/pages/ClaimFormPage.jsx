import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ClaimFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const initialFormData = {
    patient_id: '',
    provider_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    status: 'Submitted',
    total_charge: '',
    insurance_paid: '0.00',
    patient_paid: '0.00',
    items: [{ service_id: '', charge_amount: '' }] // Add claim items
  };

  const [formData, setFormData] = useState(initialFormData);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]); // Add services for dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDropdownData = async () => {
      try {
        const [patientsRes, providersRes, servicesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/providers'),
          api.get('/services') // Fetch services for claim items
        ]);
        if (isMounted) {
          setPatients(patientsRes.data || []);
          setProviders(providersRes.data || []);
          setServices(servicesRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        if (isMounted) setError('Failed to load necessary data for the form.');
      }
    };

    const fetchClaimData = async () => {
      try {
        const response = await api.get(`/claims/${id}`);
        if (isMounted) {
          const claimData = response.data;
          
          // Fetch claim items if in edit mode
          const itemsResponse = await api.get(`/claims/${id}/items`);
          const claimItems = itemsResponse.data || [];
          
          setFormData({
            patient_id: claimData.patient_id || '',
            provider_id: claimData.provider_id || '',
            claim_date: claimData.claim_date ? new Date(claimData.claim_date).toISOString().split('T')[0] : '',
            status: claimData.status || 'Submitted',
            total_charge: claimData.total_charge || '',
            insurance_paid: claimData.insurance_paid || '0.00',
            patient_paid: claimData.patient_paid || '0.00',
            items: claimItems.length > 0 ? claimItems.map(item => ({
              service_id: item.service_id.toString(),
              charge_amount: item.charge_amount.toString()
            })) : [{ service_id: '', charge_amount: '' }]
          });
        }
      } catch (err) {
        console.error("Error fetching claim details for edit:", err);
        if (isMounted) setError('Failed to fetch claim details for editing.');
      }
    };

    fetchDropdownData().then(() => {
      if (isEditMode) {
        fetchClaimData().finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        if (isMounted) setLoading(false);
      }
    });

    return () => { isMounted = false };
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes to claim items
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: value };
    
    // Update total charge when item changes
    if (name === 'charge_amount') {
      const totalCharge = newItems.reduce((sum, item) => {
        return sum + (parseFloat(item.charge_amount) || 0);
      }, 0);
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        total_charge: totalCharge.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  // Add new item to claim
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service_id: '', charge_amount: '' }]
    }));
  };

  // Remove item from claim
  const removeItem = (index) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    
    const newItems = formData.items.filter((_, i) => i !== index);
    
    // Recalculate total charge
    const totalCharge = newItems.reduce((sum, item) => {
      return sum + (parseFloat(item.charge_amount) || 0);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total_charge: totalCharge.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.patient_id || !formData.provider_id || !formData.claim_date || !formData.status || !formData.total_charge) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Create a payload that includes all fields the backend expects
    const payload = {
      patient_id: parseInt(formData.patient_id, 10),
      provider_id: parseInt(formData.provider_id, 10),
      claim_date: formData.claim_date,
      status: formData.status,
      total_charge: parseFloat(formData.total_charge) || 0,
      insurance_paid: parseFloat(formData.insurance_paid) || 0,
      patient_paid: parseFloat(formData.patient_paid) || 0,
      appointment_id: null, // Add this field to match what the backend expects
      notes: "" // Add empty notes to match what the backend expects
    };

    console.log("Submitting claim payload with additional fields:", payload);

    try {
      if (isEditMode) {
        await api.put(`/claims/${id}`, payload);
        alert('Claim updated successfully!');
        navigate('/claims');
      } else {
        const response = await api.post('/claims', payload);
        alert('Claim created successfully!');
        navigate(`/claims/${response.data.claim_id}`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} claim:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} claim.`;
      if (err.response?.data?.detail) {
        errorMessage += ` Server says: ${err.response.data.detail}`;
      } else if (err.response?.data?.message) {
        errorMessage += ` Server says: ${err.response.data.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get patient name for dropdown display
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patient_id === parseInt(patientId, 10));
    return patient ? `${patient.last_name}, ${patient.first_name}` : 'Unknown';
  };

  // Get provider name for dropdown display
  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.provider_id === parseInt(providerId, 10));
    return provider ? provider.provider_name || `${provider.last_name}, ${provider.first_name}` : 'Unknown';
  };

  if (loading && !formData.patient_id) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>{isEditMode ? `Edit Claim ${id}` : 'Create New Claim'}</h1>
      {error && <p className="alert alert-danger">Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          {/* Patient Selector */}
          <div className="col-md-6">
            <label htmlFor="patient_id" className="form-label">Patient:</label>
            <select 
              id="patient_id" 
              name="patient_id" 
              className="form-select" 
              value={formData.patient_id} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode}
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.last_name || ''}, {p.first_name || ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Provider Selector */}
          <div className="col-md-6">
            <label htmlFor="provider_id" className="form-label">Provider:</label>
            <select 
              id="provider_id" 
              name="provider_id" 
              className="form-select" 
              value={formData.provider_id} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode}
            >
              <option value="">Select Provider</option>
              {providers.map(p => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name || `${p.first_name || ''} ${p.last_name || ''}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          {/* Claim Date */}
          <div className="col-md-6">
            <label htmlFor="claim_date" className="form-label">Claim Date:</label>
            <input 
              type="date" 
              id="claim_date" 
              name="claim_date" 
              className="form-control" 
              value={formData.claim_date} 
              onChange={handleChange} 
              required 
              disabled={loading || isEditMode} 
            />
          </div>
          
          {/* Status Selector */}
          <div className="col-md-6">
            <label htmlFor="status" className="form-label">Status:</label>
            <select 
              id="status" 
              name="status" 
              className="form-select" 
              value={formData.status} 
              onChange={handleChange} 
              required 
              disabled={loading}
            >
              <option value="Submitted">Submitted</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
              <option value="Denied">Denied</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Claim Items Section */}
        <h3 className="mt-4">Claim Items</h3>
        <p className="text-muted">Add services to this claim:</p>
        
        {formData.items.map((item, index) => (
          <div key={index} className="row mb-2 align-items-center">
            <div className="col-md-5">
              <label className={index === 0 ? "form-label" : "visually-hidden"}>Service:</label>
              <select
                name="service_id"
                className="form-select"
                value={item.service_id}
                onChange={(e) => handleItemChange(index, e)}
                required
                disabled={loading && isEditMode}
              >
                <option value="">Select Service</option>
                {services.map(s => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.cpt_code} - {s.description} (${s.standard_charge})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-5">
              <label className={index === 0 ? "form-label" : "visually-hidden"}>Charge Amount:</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="charge_amount"
                  className="form-control"
                  value={item.charge_amount}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  disabled={loading && isEditMode}
                />
              </div>
            </div>
            
            <div className="col-md-2">
              {index === 0 && <label className="form-label">&nbsp;</label>}
              <button
                type="button"
                className="btn btn-danger btn-sm d-block w-100"
                onClick={() => removeItem(index)}
                disabled={formData.items.length <= 1 || loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={addItem}
            disabled={loading}
          >
            + Add Another Service
          </button>
        </div>

        <div className="row mb-3 mt-4">
          {/* Total Charge - Auto-calculated from items */}
          <div className="col-md-4">
            <label htmlFor="total_charge" className="form-label">Total Charge:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="total_charge"
                name="total_charge"
                className="form-control"
                value={formData.total_charge}
                onChange={handleChange}
                required
                readOnly
              />
              <small className="form-text text-muted">Auto-calculated from items</small>
            </div>
          </div>
          
          {/* Insurance Paid */}
          <div className="col-md-4">
            <label htmlFor="insurance_paid" className="form-label">Insurance Paid:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="insurance_paid"
                name="insurance_paid"
                className="form-control"
                value={formData.insurance_paid}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Patient Paid */}
          <div className="col-md-4">
            <label htmlFor="patient_paid" className="form-label">Patient Paid:</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="patient_paid"
                name="patient_paid"
                className="form-control"
                value={formData.patient_paid}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Claim' : 'Create Claim')}
          </button>
          <Link to="/claims" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default ClaimFormPage; 