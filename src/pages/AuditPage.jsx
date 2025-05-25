import React, { useState } from 'react';
import api, { auditClaim } from '../services/api';

// Set to false to disable debug information
const SHOW_DEBUG_INFO = false;

function AuditPage() {
  const [claimId, setClaimId] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleAudit = async () => {
    if (!claimId) {
      setError('Please enter a Claim ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setAuditResult(null);
    setDebugInfo(null);

    try {
      console.log(`[AuditPage] Sending audit request for Claim ID: ${claimId}`);

      // Remove Ollama-related fields from payload
      const payload = {
        claim_id: claimId
      };

      const data = await auditClaim(claimId, payload);
      
      if (SHOW_DEBUG_INFO) {
        console.log('[AuditPage] Audit API response data:', data);
        const debugData = {
          responseDataKeys: Object.keys(data || {}),
          hasAnalysis: !!data?.analysis,
          hasAuditResult: !!data?.audit_result,
          analysisType: typeof data?.analysis,
          auditResultType: typeof data?.audit_result,
          analysisLength: data?.analysis?.length || 0,
          auditResultLength: data?.audit_result?.length || 0,
          responseDataSample: JSON.stringify(data).substring(0, 500) + '...'
        };
        setDebugInfo(debugData);
      }

      const analysisText = data?.analysis?.trim() || data?.audit_result?.trim();
      
      if (analysisText) {
        setAuditResult(analysisText);
      } else {
        setAuditResult("Audit completed, but no analysis text was returned.");
      }

    } catch (err) {
      console.error("[AuditPage] Error performing audit:", err);
      
      const message = err.response?.data?.message || 'Failed to perform audit. Please check the Claim ID and try again.';
      setError(message);
      setAuditResult(null);
      
      if (SHOW_DEBUG_INFO) {
        setDebugInfo({
          error: true,
          errorType: err.name,
          errorMessage: err.message,
          responseStatus: err.response?.status,
          responseData: err.response?.data,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Claim Audit</h1>
      <p>Enter a Claim ID to audit the claim.</p>

      <div className="row g-3 align-items-end">
        {/* Claim ID Input */}
        <div className="col-md-6">
          <label htmlFor="claimIdInput" className="form-label">Claim ID:</label>
          <input
            type="number"
            className="form-control"
            id="claimIdInput"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            placeholder="Enter Claim ID"
            disabled={loading}
            min="0"
          />
        </div>

        {/* Audit Button */}
        <div className="col-md-6">
          <button
            className="btn btn-primary w-100"
            onClick={handleAudit}
            disabled={loading || !claimId}
          >
            {loading ? 'Auditing...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mt-3">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Audit Result Display */}
      {auditResult && (
        <div className="mt-4">
          <h2>Audit Result</h2>
          <p>This is the audit result using AWS BedRock: anthropic.claude-3-haiku-20240307-v1:0 to analyze the claim.</p>
          <div className="card">
            <div className="card-body">
              <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {auditResult}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info Display */}
      {SHOW_DEBUG_INFO && debugInfo && (
        <div className="mt-4">
          <h3>Debug Information</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default AuditPage; 