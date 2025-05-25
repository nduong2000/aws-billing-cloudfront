import React, { useState } from 'react';
import apiClient from '../services/api'; // Use the configured axios instance

function SimpleOllamaTest() {
  const [claimId, setClaimId] = useState('1'); // Default to claim 1
  const [ollamaUrl, setOllamaUrl] = useState('http://10.63.1.29:11434'); // Default to Mac Mini
  const [ollamaModel, setOllamaModel] = useState('mistral:7b'); // Default model
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [testConnResponse, setTestConnResponse] = useState(null); // State for connection test result
  const [testConnError, setTestConnError] = useState(null); // State for connection test error
  const [loadingTestConn, setLoadingTestConn] = useState(false); // Loading state for connection test

  const handleTestRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const requestUrl = `/claims/${claimId}/audit`;
    const requestBody = {
      targetOllamaUrl: ollamaUrl,
      targetOllamaModel: ollamaModel,
      claim_id: claimId // Backend might expect this too, sending just in case
    };

    console.log('[SimpleTest] Sending POST to:', requestUrl);
    console.log('[SimpleTest] Request Body:', requestBody);

    try {
      const result = await apiClient.post(requestUrl, requestBody);
      console.log('[SimpleTest] Success Response:', result.data);
      setResponse(result.data);
    } catch (err) {
      console.error('[SimpleTest] Error:', err);
      setError(
        `Request failed: ${err.message}\n` +
        `Status: ${err.response?.status || 'N/A'}\n` +
        `Response Data: ${JSON.stringify(err.response?.data, null, 2) || 'N/A'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // --- New Function for Connection Test ---
  const handleTestConnection = async () => {
    setLoadingTestConn(true);
    setTestConnError(null);
    setTestConnResponse(null);

    const requestUrl = '/ollama-test'; // New backend endpoint
    const requestBody = {
      targetOllamaUrl: ollamaUrl,
      targetOllamaModel: ollamaModel,
    };

    console.log('[SimpleTest] Sending Connection Test POST to:', requestUrl);
    console.log('[SimpleTest] Connection Test Request Body:', requestBody);

    try {
      const result = await apiClient.post(requestUrl, requestBody);
      console.log('[SimpleTest] Connection Test Success Response:', result.data);
      setTestConnResponse(result.data);
    } catch (err) {
      console.error('[SimpleTest] Connection Test Error:', err);
      setTestConnError(
        `Request failed: ${err.message}\n` +
        `Status: ${err.response?.status || 'N/A'}\n` +
        `Response Data: ${JSON.stringify(err.response?.data, null, 2) || 'N/A'}`
      );
    } finally {
      setLoadingTestConn(false);
    }
  };
  // --- End New Function ---

  return (
    <div className="container mt-4">
      <h1>Simple Backend Audit Test</h1>
      <p>Test the POST /api/claims/:id/audit endpoint directly.</p>

      <div className="mb-3">
        <label htmlFor="claimIdInput" className="form-label">Claim ID:</label>
        <input
          type="text"
          className="form-control"
          id="claimIdInput"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="ollamaUrlInput" className="form-label">Ollama URL:</label>
        <input
          type="text"
          className="form-control"
          id="ollamaUrlInput"
          value={ollamaUrl}
          onChange={(e) => setOllamaUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="ollamaModelInput" className="form-label">Ollama Model:</label>
        <input
          type="text"
          className="form-control"
          id="ollamaModelInput"
          value={ollamaModel}
          onChange={(e) => setOllamaModel(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        className="btn btn-primary me-2" // Added margin
        onClick={handleTestRequest}
        disabled={loading || !claimId || !ollamaUrl || !ollamaModel}
      >
        {loading ? 'Auditing...' : 'Send Full Audit Request'}
      </button>

      {/* --- Add Connection Test Button --- */}
      <button
        className="btn btn-secondary"
        onClick={handleTestConnection}
        disabled={loadingTestConn || !ollamaUrl || !ollamaModel}
      >
        {loadingTestConn ? 'Testing Connection...' : 'Test Backend->Ollama Connection'}
      </button>
      {/* --- End Connection Test Button --- */}

      {/* --- Display Connection Test Results --- */}
      {testConnError && (
        <div className="alert alert-warning mt-3" role="alert">
          <h2>Connection Test Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{testConnError}</pre>
        </div>
      )}
      {testConnResponse && (
        <div className="alert alert-info mt-3" role="alert">
          <h2>Connection Test Success:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(testConnResponse, null, 2)}</pre>
        </div>
      )}
      {/* --- End Display Connection Test Results --- */}

      {/* Display Audit Test Results (existing) */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <h2>Audit Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}
      {response && (
        <div className="alert alert-success mt-3" role="alert">
          <h2>Audit Success:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SimpleOllamaTest; 