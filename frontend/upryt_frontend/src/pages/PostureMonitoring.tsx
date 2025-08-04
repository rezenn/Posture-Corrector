// PostureDashboard.tsx
import React, { useEffect, useState } from 'react';

interface PostureData {
  posture: string;
  shoulder_angle: number;
  neck_angle: number;
  spine_angle: number;
  symmetry_score: number;
  eye_distance: number;
  posture_score: number;
  session: {
    session_time: number;
    good_posture_time: number;
    poor_posture_time: number;
    corrections: number;
    posture_changes: number;
    current_streak: number;
    max_good_streak: number;
    max_poor_streak: number;
    good_posture_percent: number;
  };
}

const PostureMonitoring: React.FC = () => {
  const [data, setData] = useState<PostureData | null>(null);
  const [summary, setSummary] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posture/latest');
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching posture data:', err);
    }
  };

  const generateSummary = async () => {
    try {
      const res = await fetch('http://localhost:5001/generate_summary');
      const json = await res.json();
      setSummary(json.text);
    } catch (err) {
      console.error('Error generating summary:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e2d3b] min-h-screen text-white p-4 font-sans">
      <h2 className="text-center text-2xl font-bold mb-4">Posture Monitoring System</h2>

      <div className="flex flex-wrap justify-center gap-4">
        {/* Left Panel */}
        <div className="bg-[#2b3e50] p-4 rounded-lg max-w-xl w-full">
          <h3 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Posture Status</h3>
          <div className={`font-bold mb-2 ${data?.posture === 'Good Posture' ? 'text-green-400' : 'text-red-400'}`}>{data?.posture || 'Loading...'}</div>

          <h3 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Body Angles + Distance:</h3>
          <div className="bg-[#101920] border border-gray-700 p-2 font-mono whitespace-pre-line mb-2">
            Shoulder: {data?.shoulder_angle ?? '-'}° | Neck: {data?.neck_angle ?? '-'}°
            <br />Spine: {data?.spine_angle ?? '-'}° | Symmetry Δ: {data?.symmetry_score ?? '-'}°
            <br />Eye Distance: {data?.eye_distance ?? '-'}px
          </div>

          <h3 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Live Camera Feed</h3>
          <div className="bg-[#101920] rounded-md p-2 flex justify-center mb-2">
            <img src="http://localhost:5001/video_feed" alt="Live Feed" className="rounded-md w-full max-w-sm" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-[#2b3e50] p-4 rounded-lg max-w-xl w-full">
          <h3 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Session Statistics</h3>
          <div className="mb-1">Session Time: {data?.session.session_time ?? '-'}s</div>
          <div className="mb-1">Good Posture Time: {data?.session.good_posture_time ?? '-'}s</div>
          <div className="mb-1">Poor Posture Time: {data?.session.poor_posture_time ?? '-'}s</div>
          <div className="mb-1">Corrections: {data?.session.corrections ?? '-'}</div>
          <div className="mb-1">Posture Changes: {data?.session.posture_changes ?? '-'}</div>
          <div className="mb-1">Current Streak: {data?.session.current_streak ?? '-'}s</div>
          <div className="mb-1">Max Good Streak: {data?.session.max_good_streak ?? '-'}s</div>
          <div className="mb-1">Max Poor Streak: {data?.session.max_poor_streak ?? '-'}s</div>
          <div className="mb-1">Good Posture %: {data?.session.good_posture_percent ?? '-'}%</div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={() => alert('Implement CSV Export')} className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-1 px-4 rounded">Export CSV</button>
            <button onClick={() => alert('Implement PDF Export')} className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-1 px-4 rounded">Export PDF</button>
          </div>

          <div className="pt-6">Posture Score:</div>
          <div className="bg-gray-700 h-4 rounded overflow-hidden">
            <div className="bg-green-400 h-full transition-all duration-300" style={{ width: `${data?.posture_score ?? 0}%` }}></div>
          </div>

          <h3 className="text-lg font-semibold mt-6">Daily Summary</h3>
          <button onClick={generateSummary} className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-1 px-4 rounded my-2">Generate Today&apos;s Summary</button>
          <textarea readOnly className="w-full h-28 bg-[#1e2d3b] text-white p-2 rounded-md" value={summary}></textarea>
        </div>
      </div>
    </div>
  );
};

export default  PostureMonitoring;
