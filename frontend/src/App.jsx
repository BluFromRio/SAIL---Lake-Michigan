import React, { useState } from 'react';
import ProjectForm from './components/ProjectForm';
import FeasibilityResults from './components/FeasibilityResults';
import DocumentUpload from './components/DocumentUpload';
import ReviewResults from './components/ReviewResults';
import VisualGenerator from './components/VisualGenerator';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState(null);
  const [feasibilityResults, setFeasibilityResults] = useState(null);
  const [narrativeResults, setNarrativeResults] = useState(null);
  const [reviewResults, setReviewResults] = useState(null);
  const [visualResults, setVisualResults] = useState(null);

  const handleProjectSubmit = async (data) => {
    setProjectData(data);
    
    try {
      const response = await fetch('/api/feasibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const results = await response.json();
      setFeasibilityResults(results);
      
      const narrativeResponse = await fetch('/api/generate-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const narrativeData = await narrativeResponse.json();
      setNarrativeResults(narrativeData);
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing project:', error);
    }
  };

  const handleDocumentUpload = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('project_data', JSON.stringify(projectData));

    try {
      const response = await fetch('/api/review-permit', {
        method: 'POST',
        body: formData
      });
      const results = await response.json();
      setReviewResults(results);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error reviewing document:', error);
    }
  };

  const handleGenerateVisual = async (visualData) => {
    try {
      const response = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...projectData, ...visualData })
      });
      const results = await response.json();
      setVisualResults(results);
    } catch (error) {
      console.error('Error generating visual:', error);
    }
  };

  const exportDocument = async (type) => {
    try {
      const response = await fetch('/api/export-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          project_data: projectData,
          feasibility_results: feasibilityResults,
          narrative_results: narrativeResults,
          review_results: reviewResults,
          visual_results: visualResults
        })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permit-package.${type}`;
      a.click();
    } catch (error) {
      console.error('Error exporting document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏗️ PermitCheck AI</h1>
          <p className="text-xl text-gray-600">AI-Powered Feasibility and Permit Review Assistant</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex mb-8">
            <div className="flex items-center w-full">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>1</div>
                <span className="ml-2">Project Input</span>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>2</div>
                <span className="ml-2">Feasibility Check</span>
              </div>
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>3</div>
                <span className="ml-2">Document Review</span>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <ProjectForm onSubmit={handleProjectSubmit} />
          )}

          {currentStep === 2 && feasibilityResults && narrativeResults && (
            <div className="space-y-8">
              <FeasibilityResults results={feasibilityResults} />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Construction Narrative</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="whitespace-pre-wrap">{narrativeResults.narrative}</p>
                </div>
                <div className="flex space-x-4 mb-6">
                  <button 
                    onClick={() => exportDocument('pdf')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Export as PDF
                  </button>
                  <button 
                    onClick={() => exportDocument('docx')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Export as DOCX
                  </button>
                </div>
              </div>

              <VisualGenerator 
                onGenerate={handleGenerateVisual}
                results={visualResults}
              />

              <DocumentUpload onUpload={handleDocumentUpload} />
            </div>
          )}

          {currentStep === 3 && reviewResults && (
            <ReviewResults 
              results={reviewResults} 
              onExport={exportDocument}
              onBackToUpload={() => setCurrentStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;