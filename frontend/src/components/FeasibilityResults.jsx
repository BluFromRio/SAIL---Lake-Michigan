import React from 'react';

const FeasibilityResults = ({ results }) => {
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Feasible':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Needs Variance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Not Feasible':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'Feasible':
        return '✅';
      case 'Needs Variance':
        return '⚠️';
      case 'Not Feasible':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Feasibility Assessment</h3>
      
      <div className={`border-2 rounded-lg p-4 mb-6 ${getVerdictColor(results.verdict)}`}>
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{getVerdictIcon(results.verdict)}</span>
          <h4 className="text-lg font-semibold">Verdict: {results.verdict}</h4>
        </div>
        {results.confidence_score && (
          <p className="text-sm opacity-80">Confidence: {results.confidence_score}%</p>
        )}
      </div>

      <div className="mb-6">
        <h5 className="font-semibold text-gray-700 mb-2">Code Compliance Summary:</h5>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="whitespace-pre-wrap">{results.compliance_summary}</p>
        </div>
      </div>

      {results.zoning_info && (
        <div className="mb-6">
          <h5 className="font-semibold text-gray-700 mb-2">Zoning Information:</h5>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p><span className="font-medium">District:</span> {results.zoning_info.district}</p>
            <p><span className="font-medium">Classification:</span> {results.zoning_info.classification}</p>
            {results.zoning_info.restrictions && (
              <div className="mt-2">
                <span className="font-medium">Key Restrictions:</span>
                <ul className="list-disc list-inside mt-1">
                  {results.zoning_info.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {results.issues && results.issues.length > 0 && (
        <div className="mb-6">
          <h5 className="font-semibold text-red-600 mb-2">Issues Identified:</h5>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <ul className="list-disc list-inside space-y-1">
              {results.issues.map((issue, index) => (
                <li key={index} className="text-red-700">{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {results.recommendations && results.recommendations.length > 0 && (
        <div className="mb-6">
          <h5 className="font-semibold text-blue-600 mb-2">Recommendations:</h5>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <ul className="list-disc list-inside space-y-1">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="text-blue-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {results.required_permits && results.required_permits.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-700 mb-2">Required Permits:</h5>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {results.required_permits.map((permit, index) => (
                <li key={index}>{permit}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeasibilityResults;