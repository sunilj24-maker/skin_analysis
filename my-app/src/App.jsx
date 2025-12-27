import React, { useState, useRef } from 'react';
import { Upload, Camera, Activity, Droplet, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  // Trigger file input click
  const handleDragClick = () => {
    fileInputRef.current.click();
  };

  // Send image to FastAPI backend
  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Ensure your Python backend is running on port 8000
      const response = await fetch('https://suniltechox-ai-skin-analysis-backend.hf.space/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to connect to the skin analysis server.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not analyze image. Is the Python backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
               Routine ready
            </span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Advanced Skin Analysis
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900">
            Professional Skin Analysis <br />
            <span className="text-indigo-600">Powered by AI</span>
          </h1>
          <p className="text-lg text-slate-600">
            Upload a selfie to detect skin conditions and get a personalized, 
            dermatologist-grade skincare routine in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: Upload Area */}
          <div className="space-y-6">
            <div 
              onClick={handleDragClick}
              className={`
                relative group cursor-pointer 
                bg-white border-2 border-dashed rounded-3xl p-8 
                transition-all duration-300 ease-in-out
                ${preview ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />

              {preview ? (
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-square">
                  <img src={preview} alt="Skin Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Camera size={20} /> Change Photo
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Upload Photo</h3>
                  <p className="text-sm text-center max-w-xs">
                    Drag & drop or click to upload. <br />
                    Ensure good lighting and no makeup.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200
                flex items-center justify-center gap-2 transition-all transform active:scale-95
                ${!file || loading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Skin...
                </>
              ) : (
                <>
                  Run Analysis <ArrowRight size={20} />
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                <AlertTriangle className="shrink-0" size={20} />
                {error}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="space-y-6">
            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border border-slate-200 rounded-3xl bg-white/50 p-8 text-center">
                <Activity size={48} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600">No Analysis Yet</h3>
                <p className="text-sm">Upload a photo to see your personalized report here.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl bg-white p-8">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-800">Scanning Dermis...</h3>
                <p className="text-slate-500">Checking for 18 skin conditions</p>
              </div>
            )}

            {result && (
              <div className="animate-fade-in space-y-6">
                
                {/* 1. Diagnosis Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="text-indigo-500" size={20} /> Diagnosis
                    </h2>
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      AI Confidence Level: High
                    </span>
                  </div>
                  
                  <div className="p-6">
                    {result.diagnosis.length === 0 ? (
                      <div className="flex items-center gap-4 text-green-700 bg-green-50 p-4 rounded-xl">
                        <CheckCircle size={24} />
                        <div>
                          <p className="font-bold">Excellent Skin Health!</p>
                          <p className="text-sm opacity-80">No significant concerns detected.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {result.diagnosis.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                            <span className="font-semibold capitalize text-slate-700 group-hover:text-indigo-700">
                              {item.condition}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                  style={{ width: `${item.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-slate-600 w-12 text-right">
                                {item.confidence.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Ingredients & Routine */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <Droplet className="text-blue-500" size={20} /> Recommended Routine
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Active Ingredients List */}
                    {result.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.ingredients.map((ing, i) => (
                          <span key={i} className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    <div className="space-y-4">
                      {result.routine.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            {idx !== result.routine.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-100"></div>
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                              {step.step.split('.')[1] || "Step"}
                            </p>
                            <h4 className="text-lg font-bold text-slate-800 mb-1">
                              {step.product}
                            </h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                              {step.why}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Safety Warning */}
                  <div className="bg-yellow-50 p-4 border-t border-yellow-100 flex gap-3">
                    <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      <strong>Safety Note:</strong> Do not start all products at once. Introduce one new product every 2 weeks to monitor for allergies. Consult a dermatologist for persistent issues.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}