import React from 'react';

const ReviewResults = ({ results, onExport, onBackToUpload }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Low':
        return '🟢';
      case 'Medium':
        return '🟡';
      case 'High':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Permit Review Results</h2>
          <button
            onClick={onBackToUpload}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Upload Different Document
          </button>
        </div>
        
        <div className={`border-2 rounded-lg p-6 mb-6 ${getRiskColor(results.rejection_risk)}`}>
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">{getRiskIcon(results.rejection_risk)}</span>
            <div>
              <h3 className="text-xl font-bold">Rejection Risk: {results.rejection_risk}</h3>
              {results.confidence_score && (
                <p className="text-sm opacity-80">Confidence: {results.confidence_score}%</p>
              )}
            </div>
          </div>
          
          {results.risk_summary && (
            <p className="mt-2">{results.risk_summary}</p>
          )}
        </div>

        {results.overall_assessment && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Overall Assessment:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{results.overall_assessment}</p>
            </div>
          </div>
        )}
      </div>

      {results.issues && results.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-red-600 mb-4">Issues Found ({results.issues.length})</h4>
          <div className="space-y-3">
            {results.issues.map((issue, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{issue.category || 'General Issue'}</p>
                    <p className="text-red-600 mt-1">{issue.description || issue}</p>
                    {issue.severity && (
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                        issue.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                        issue.severity === 'Major' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {issue.severity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.fixes && results.fixes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-blue-600 mb-4">Recommended Fixes ({results.fixes.length})</h4>
          <div className="space-y-3">
            {results.fixes.map((fix, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">💡</span>
                  <div className="flex-1">
                    <p className="text-blue-700 font-medium">{fix.category || 'Recommendation'}</p>
                    <p className="text-blue-600 mt-1">{fix.description || fix}</p>
                    {fix.priority && (
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                        fix.priority === 'High' ? 'bg-red-200 text-red-800' :
                        fix.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        Priority: {fix.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.missing_documents && results.missing_documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-orange-600 mb-4">Missing Documents</h4>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <ul className="list-disc list-inside space-y-2">
              {results.missing_documents.map((doc, index) => (
                <li key={index} className="text-orange-700">{doc}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {results.compliance_check && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-700 mb-4">Compliance Check</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.compliance_check).map(([category, status]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status === 'Pass' ? 'bg-green-200 text-green-800' :
                  status === 'Fail' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-700 mb-4">Export Options</h4>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onExport('pdf')}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            📄 Export Review as PDF
          </button>
          <button
            onClick={() => onExport('docx')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            📝 Export Review as DOCX
          </button>
          <button
            onClick={() => onExport('checklist')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            ✅ Export Fix Checklist
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Address the high-priority issues first, then re-upload your revised document for another review to track your progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewResults;