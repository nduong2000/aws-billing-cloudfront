import React, { useState } from 'react';
import api, { auditClaim } from '../services/api';

// Set to false to disable debug information
const SHOW_DEBUG_INFO = false;

// Available AI models for audit
const AVAILABLE_MODELS = [
  {
    id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic'
  },
  {
    id: 'us.anthropic.claude-3-7-sonnet-20250109-v1:0',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic'
  },
  {
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic'
  },
  {
    id: 'us.meta.llama4-scout-17b-instruct-v1:0',
    name: 'Llama 4 Scout 17B Instruct',
    provider: 'Meta'
  },
  {
    id: 'us.meta.llama4-maverick-17b-instruct-v1:0',
    name: 'Llama 4 Maverick 17B Instruct',
    provider: 'Meta'
  }
];

// Default model
const DEFAULT_MODEL = 'us.anthropic.claude-sonnet-4-20250514-v1:0';

function AuditPage() {
  const [claimId, setClaimId] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [modelUsed, setModelUsed] = useState(null);

  const handleAudit = async () => {
    if (!claimId) {
      setError('Please enter a Claim ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setAuditResult(null);
    setDebugInfo(null);
    setModelUsed(null);

    try {
      console.log(`[AuditPage] Sending audit request for Claim ID: ${claimId} with model: ${selectedModel}`);

      // Include the selected model in the payload
      const payload = {
        claim_id: claimId,
        model_id: selectedModel
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
        
        // Extract model information from response details
        const details = data?.details || {};
        const usedModelId = details.model_used || selectedModel;
        const usedModelName = details.model_name || AVAILABLE_MODELS.find(m => m.id === usedModelId)?.name || 'Unknown Model';
        const usedModelProvider = details.model_provider || AVAILABLE_MODELS.find(m => m.id === usedModelId)?.provider || 'Unknown Provider';
        
        setModelUsed({
          id: usedModelId,
          name: usedModelName,
          provider: usedModelProvider
        });
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
      <p>Enter a Claim ID and select an AI model to audit the claim.</p>

      <div className="row g-3 align-items-end">
        {/* Claim ID Input */}
        <div className="col-md-4">
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

        {/* Model Selection Dropdown */}
        <div className="col-md-4">
          <label htmlFor="modelSelect" className="form-label">AI Model:</label>
          <select
            className="form-select"
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading}
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Audit Button */}
        <div className="col-md-4">
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">
              Analysis completed using AWS Bedrock AI model.
            </p>
            {modelUsed && (
              <div className="badge bg-info text-dark">
                <strong>Model:</strong> {modelUsed.name} ({modelUsed.provider})
              </div>
            )}
          </div>
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