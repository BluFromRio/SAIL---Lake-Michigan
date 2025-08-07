import React, { useState } from 'react';

const VisualGenerator = ({ onGenerate, results }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [visualType, setVisualType] = useState('3d_rendering');
  const [customPrompt, setCustomPrompt] = useState('');

  const visualTypes = [
    { value: '3d_rendering', label: '3D Conceptual Rendering', description: 'Realistic 3D view of the structure' },
    { value: 'site_plan', label: 'Site Layout Plan', description: 'Top-down view showing placement on lot' },
    { value: 'elevation', label: 'Elevation View', description: 'Side view showing height and proportions' },
    { value: 'floor_plan', label: 'Floor Plan', description: 'Interior layout and dimensions' }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate({
        visual_type: visualType,
        custom_prompt: customPrompt
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🎨 Visual Generator</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          {isExpanded ? 'Hide' : 'Generate Visuals'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Generate visual diagrams and renderings to include in your permit package or client presentations.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visual Type
            </label>
            <div className="space-y-2">
              {visualTypes.map((type) => (
                <label key={type.value} className="flex items-start">
                  <input
                    type="radio"
                    name="visualType"
                    value={type.value}
                    checked={visualType === type.value}
                    onChange={(e) => setVisualType(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific details like colors, landscaping, surrounding structures, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-2 px-4 rounded-md transition duration-200 ${
              generating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white`}
          >
            {generating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Visual...
              </div>
            ) : (
              'Generate Visual'
            )}
          </button>

          {results && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-3">Generated Visual</h4>
              {results.image_url ? (
                <div className="space-y-4">
                  <img
                    src={results.image_url}
                    alt="Generated visual"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="flex space-x-2">
                    <a
                      href={results.image_url}
                      download="permit-visual.png"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Download Image
                    </a>
                    <button
                      onClick={handleGenerate}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                    >
                      Generate New Version
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>{results.error || 'No visual generated yet'}</p>
                </div>
              )}
              
              {results.prompt_used && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Prompt used:</strong> {results.prompt_used}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isExpanded && (
        <p className="text-gray-500 text-sm">
          Click "Generate Visuals" to create 3D renderings, site plans, and other visual aids for your permit application.
        </p>
      )}
    </div>
  );
};

export default VisualGenerator;