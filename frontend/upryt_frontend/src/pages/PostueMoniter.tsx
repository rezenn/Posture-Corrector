"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import WidthWrapper from "../components/WidthWrapper"; // Assuming this is your layout component
import { Button } from "../components/ui/button";
import { toast } from "sonner";

interface PostureData {
    status: string;
    data: {
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
    };
}

export default function PostureMonitoring() {
    const [postureData, setPostureData] = useState<PostureData["data"] | null>(null);

    // Fetch posture data every second
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/posture/latest");
                const json: PostureData = await response.json();
                if (json.status === "success") {
                    setPostureData(json.data);
                }
            } catch (error) {
                console.error("Error fetching posture data:", error);
                // toast.error("Failed to fetch posture data");
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    // Export PDF
    const exportPDFWithDialog = async () => {
        if (!postureData) {
            toast.error("No posture data available");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Upryt - Posture Session Report", 105, 20, { align: "center" });
        doc.setFontSize(12);

        let y = 35;
        const now = new Date().toLocaleString();
        const s = postureData.session;

        const rows = [
            ["Generated", now],
            ["Posture", postureData.posture],
            ["Shoulder Angle", `${postureData.shoulder_angle}°`],
            ["Neck Angle", `${postureData.neck_angle}°`],
            ["Spine Angle", `${postureData.spine_angle}°`],
            ["Symmetry Δ", `${postureData.symmetry_score}°`],
            ["Eye Distance", `${postureData.eye_distance}px`],
            ["Posture Score", `${postureData.posture_score}%`],
            ["Session Time", `${s.session_time}s`],
            ["Good Posture Time", `${s.good_posture_time}s`],
            ["Poor Posture Time", `${s.poor_posture_time}s`],
            ["Corrections", s.corrections.toString()],
            ["Posture Changes", s.posture_changes.toString()],
            ["Current Streak", `${s.current_streak}s`],
            ["Max Good Streak", `${s.max_good_streak}s`],
            ["Max Poor Streak", `${s.max_poor_streak}s`],
            ["Good Posture %", `${s.good_posture_percent}%`],
        ];

        rows.forEach(([label, val]) => {
            doc.text(`${label}: ${val}`, 20, y);
            y += 8;
        });

        if ("showSaveFilePicker" in window) {
            try {
                const options = {
                    suggestedName: "posture_report.pdf",
                    types: [{ description: "PDF Document", accept: { "application/pdf": [".pdf"] } }],
                };
                const handle = await (window as any).showSaveFilePicker(options);
                const writable = await handle.createWritable();
                await writable.write(doc.output("blob"));
                await writable.close();
                toast.success("PDF saved successfully");
            } catch (err) {
                console.error("Save cancelled or failed:", err);
                toast.error("Failed to save PDF");
            }
        } else {
            doc.save("posture_report.pdf");
        }
    };

    // Export CSV
    const exportCSVWithDialog = async () => {
        if (!postureData) {
            toast.error("No posture data available");
            return;
        }

        const s = postureData.session;
        const rows = [
            ["Posture", postureData.posture],
            ["Shoulder Angle", postureData.shoulder_angle],
            ["Neck Angle", postureData.neck_angle],
            ["Spine Angle", postureData.spine_angle],
            ["Symmetry Δ", postureData.symmetry_score],
            ["Eye Distance", postureData.eye_distance],
            ["Posture Score", postureData.posture_score],
            ["Session Time", s.session_time],
            ["Good Posture Time", s.good_posture_time],
            ["Poor Posture Time", s.poor_posture_time],
            ["Corrections", s.corrections],
            ["Posture Changes", s.posture_changes],
            ["Current Streak", s.current_streak],
            ["Max Good Streak", s.max_good_streak],
            ["Max Poor Streak", s.max_poor_streak],
            ["Good Posture %", s.good_posture_percent],
        ];

        const csv = rows.map((row) => row.join(",")).join("\n");

        if ("showSaveFilePicker" in window) {
            try {
                const options = {
                    suggestedName: "posture_data.csv",
                    types: [{ description: "CSV File", accept: { "text/csv": [".csv"] } }],
                };
                const handle = await (window.showSaveFilePicker as (options?: any) => Promise<any>)(options);
                const writable = await handle.createWritable();
                await writable.write(new Blob([csv], { type: "text/csv" }));
                await writable.close();
                toast.success("CSV saved successfully");
            } catch (err) {
                console.error("Save cancelled or failed:", err);
                toast.error("Failed to save CSV");
            }
        } else {
            const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
            const link = document.createElement("a");
            link.href = encodedUri;
            link.download = "posture_data.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <WidthWrapper>
                <h2 className="text-center text-2xl font-bold mb-2.5">Upryt - Posture Monitoring System</h2>
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {/* Posture Status Panel */}
                    <div className="bg-gray-800 p-4 rounded-lg flex-1 max-w-[600px] box-border">
                        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Posture Status</h3>
                        <div
                            className={`text-base font-bold mb-2.5 ${postureData?.posture === "Good Posture" ? "text-green-400" : "text-red-400"
                                }`}
                        >
                            {postureData?.posture || "Loading..."}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">
                            Body Angles (Shoulder, Neck, Spine, Symmetry) + Distance
                        </h3>
                        <div className="bg-gray-950 border border-gray-700 p-2 font-mono whitespace-pre-line mb-2.5">
                            Shoulder: <span>{postureData?.shoulder_angle || "-"}°</span> | Neck:{" "}
                            <span>{postureData?.neck_angle || "-"}°</span>
                            <br />
                            Spine: <span>{postureData?.spine_angle || "-"}°</span> | Symmetry Δ:{" "}
                            <span>{postureData?.symmetry_score || "-"}°</span>
                            <br />
                            Eye Distance: <span>{postureData?.eye_distance || "-"}px</span>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Live Camera Feed</h3>
                        <div className="bg-gray-950 flex justify-center items-center p-2 rounded-md mb-2.5">
                            <img
                                src="http://localhost:5001/video_feed"
                                alt="Live Feed"
                                className="w-full max-w-[480px] h-auto rounded-md"
                            />
                        </div>
                    </div>

                    {/* Session Statistics Panel */}
                    <div className="bg-gray-800 p-4 rounded-lg flex-1 max-w-[600px] box-border">
                        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Session Statistics</h3>
                        <div className="mb-1.5">Session Time: <span>{postureData?.session.session_time || "-"}s</span></div>
                        <div className="mb-1.5">Good Posture Time: <span>{postureData?.session.good_posture_time || "-"}s</span></div>
                        <div className="mb-1.5">Poor Posture Time: <span>{postureData?.session.poor_posture_time || "-"}s</span></div>
                        <div className="mb-1.5">Corrections: <span>{postureData?.session.corrections || "-"}</span></div>
                        <div className="mb-1.5">Posture Changes: <span>{postureData?.session.posture_changes || "-"}</span></div>
                        <div className="mb-1.5">Current Streak: <span>{postureData?.session.current_streak || "-"}s</span></div>
                        <div className="mb-1.5">Max Good Streak: <span>{postureData?.session.max_good_streak || "-"}s</span></div>
                        <div className="mb-1.5">Max Poor Streak: <span>{postureData?.session.max_poor_streak || "-"}s</span></div>
                        <div className="mb-1.5">Good Posture %: <span>{postureData?.session.good_posture_percent || "-"}%</span></div>
                        <div className="pt-12">Posture Score:</div>
                        <div className="h-[18px] bg-gray-700 rounded-md overflow-hidden mt-1.5">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${postureData?.posture_score || 0}%` }}
                            />
                        </div>
                        <div className="flex gap-2.5 mt-4 flex-wrap">
                            <Button className="bg-cyan-500 text-white hover:bg-cyan-600" onClick={exportCSVWithDialog}>
                                Export CSV
                            </Button>
                            <Button className="bg-cyan-500 text-white hover:bg-cyan-600" onClick={exportPDFWithDialog}>
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </WidthWrapper>
        </div>
    );
}