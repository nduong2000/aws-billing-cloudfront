import React from 'react';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Medical Billing Management System</h1>
      <p>Welcome to the comprehensive medical billing management platform.</p>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>👥 Patient Management</h3>
          <p>Manage patient information, insurance details, and medical history.</p>
        </div>
        
        <div className="feature-card">
          <h3>🏥 Provider Management</h3>
          <p>Track healthcare providers, specialties, and NPI numbers.</p>
        </div>
        
        <div className="feature-card">
          <h3>📋 Services & CPT Codes</h3>
          <p>Manage medical services with standardized CPT codes and pricing.</p>
        </div>
        
        <div className="feature-card">
          <h3>📅 Appointments</h3>
          <p>Schedule and track patient appointments with providers.</p>
        </div>
        
        <div className="feature-card">
          <h3>💰 Claims Processing</h3>
          <p>Submit, track, and manage insurance claims and payments.</p>
        </div>
        
        <div className="feature-card">
          <h3>🔍 Audit & Compliance</h3>
          <p>Audit claims for fraud detection and compliance monitoring.</p>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <p>Select an option from the navigation menu to get started.</p>
      </div>
    </div>
  );
}

export default HomePage; 