import { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, AlertTriangle, EyeOff, CheckCircle2, ShieldAlert, FileText, Download, Check, RefreshCw } from "lucide-react";

export default function CsvImporterTab({ groupId, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [stagedRows, setStagedRows] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);

    // Editing states
    const [editDesc, setEditDesc] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editCurrency, setEditCurrency] = useState("");
    const [editPayer, setEditPayer] = useState("");
    const [editShared, setEditShared] = useState("");

    const fetchStagedRows = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/family/${groupId}/shared-expenses/import/staged`);
            setStagedRows(res.data || []);
        } catch (err) {
            console.error("Error loading staged import cache:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStagedRows();
    }, [groupId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/import/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFile(null);
            fetchStagedRows();
        } catch (err) {
            console.error("CSV upload failed:", err);
            alert("CSV Upload failed. Make sure columns and formats are matching standard layouts.");
        } finally {
            setUploading(false);
        }
    };

    const handleResolveEdit = (row) => {
        setResolvingId(row.id);
        setEditDesc(row.description || "");
        setEditAmount(row.totalAmount || "0");
        setEditDate(row.date || "");
        setEditCurrency(row.currency || "INR");
        setEditPayer(row.payerEmail || "");
        setEditShared(row.sharedWith || "");
    };

    const handleSaveResolve = async (rowId, updateFields = {}) => {
        try {
            const payload = { ...updateFields };
            if (resolvingId === rowId) {
                payload.description = editDesc;
                payload.totalAmount = parseFloat(editAmount);
                payload.date = editDate;
                payload.currency = editCurrency;
                payload.payerEmail = editPayer;
                payload.sharedWith = editShared;
            }

            await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/import/resolve/${rowId}`, payload);
            setResolvingId(null);
            fetchStagedRows();
        } catch (err) {
            console.error("Error updating staged row:", err);
            alert("Failed to update staged row");
        }
    };

    const handleIgnoreRow = async (rowId) => {
        await handleSaveResolve(rowId, { ignored: true });
    };

    const handleApproveAll = async () => {
        if (!window.confirm("Approve all staged entries? Confirmed rows will commit to the expenses ledger.")) return;
        try {
            setLoading(true);
            const res = await axios.post(`http://localhost:8080/family/${groupId}/shared-expenses/import/approve`);
            alert(`Import Approved!\nExpenses: ${res.data.expensesImported}\nSettlements: ${res.data.settlementsImported}`);
            fetchStagedRows();
            if (onImportSuccess) onImportSuccess();
        } catch (err) {
            console.error("Error approving import staged list:", err);
            alert("Approval failed");
        } finally {
            setLoading(false);
        }
    };

    const getAnomalyCount = () => {
        return stagedRows.reduce((acc, curr) => {
            try {
                const arr = JSON.parse(curr.anomalies || "[]");
                return acc + arr.length;
            } catch (e) { return acc; }
        }, 0);
    };

    const downloadImportReport = () => {
        // Build raw text report representing Deliverable 6
        let report = `EXPENSE TRACKER - CSV IMPORT REPORT\n`;
        report += `Generated: ${new Date().toISOString()}\n`;
        report += `Group ID: ${groupId}\n`;
        report += `Staged Rows Checked: ${stagedRows.length}\n`;
        report += `--------------------------------------------------\n\n`;

        stagedRows.forEach((row, index) => {
            report += `Row #${index + 1}: [${row.date}] "${row.description}" | Payer: ${row.payerEmail} | Amount: ${row.currency} ${row.totalAmount}\n`;
            try {
                const anomaliesList = JSON.parse(row.anomalies || "[]");
                if (anomaliesList.length > 0) {
                    report += `  Flagged Anomalies:\n`;
                    anomaliesList.forEach(a => {
                        report += `    - [${a.type}]: ${a.details}\n`;
                    });
                } else {
                    report += `  Status: Clean / No anomalies\n`;
                }
            } catch (e) {}
            report += `  Action taken: ${row.ignored ? "DISCARDED/IGNORED" : "APPROVED & SYNCED"}\n`;
            report += `--------------------------------------------------\n`;
        });

        const element = document.createElement("a");
        const fileBlob = new Blob([report], { type: "text/plain" });
        element.href = URL.createObjectURL(fileBlob);
        element.download = `import_report_group_${groupId}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading && stagedRows.length === 0) {
        return <div className="text-center py-6 text-slate-400">Loading CSV importer...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-indigo-400">📥</span> Flatmate CSV Importer
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Ingest dirty exports without touching them by hand. Flag duplicates, normalize formats, and override items.
                    </p>
                </div>

                {stagedRows.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={downloadImportReport}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-950/40 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 text-xs font-semibold transition-all"
                        >
                            <Download size={14} /> Download Import Report
                        </button>

                        <button
                            onClick={handleApproveAll}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-650 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
                        >
                            <Check size={14} /> Approve All Staged
                        </button>
                    </div>
                )}
            </div>

            {/* UPLOAD FORM */}
            {stagedRows.length === 0 && (
                <form onSubmit={handleUpload} className="border-2 border-dashed border-slate-800 bg-slate-900/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
                        <UploadCloud size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">Upload expenses_export.csv</h4>
                        <p className="text-xs text-slate-500">Drag and drop file here, or click to browse files.</p>
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                        required
                    />
                    {file && (
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs transition-all shadow-md"
                        >
                            {uploading ? "Analyzing CSV sheet..." : "Process CSV"}
                        </button>
                    )}
                </form>
            )}

            {/* STAGED LIST & ANOMALY PREVIEW */}
            {stagedRows.length > 0 && (
                <div className="space-y-6">
                    {/* ANOMALY REPORT HEADER */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/30 border border-slate-800 p-6 rounded-2xl">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-550 block">Staged Rows</span>
                            <span className="text-2xl font-black text-slate-100">{stagedRows.length}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-550 block">Detected Anomalies</span>
                            <span className="text-2xl font-black text-rose-450">{getAnomalyCount()}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-550 block">Audit Action policy</span>
                            <span className="text-2xl font-black text-emerald-400">Interactive Staged area</span>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="p-4">Details / Item</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Payer</th>
                                        <th className="p-4">Split With</th>
                                        <th className="p-4">Flagged Anomalies</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850">
                                    {stagedRows.map((row) => {
                                        const anomalies = JSON.parse(row.anomalies || "[]");
                                        const isEditing = resolvingId === row.id;

                                        return (
                                            <tr key={row.id} className={`hover:bg-slate-950/20 transition-all ${anomalies.length > 0 ? "bg-rose-500/[0.01]" : ""}`}>
                                                <td className="p-4 max-w-[200px] truncate">
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                value={editDesc}
                                                                onChange={(e) => setEditDesc(e.target.value)}
                                                                className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200 w-full"
                                                            />
                                                            <input
                                                                type="date"
                                                                value={editDate}
                                                                onChange={(e) => setEditDate(e.target.value)}
                                                                className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200 w-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="font-bold text-slate-200 block">{row.description}</span>
                                                            <span className="text-[10px] text-slate-500">{row.date}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="p-4">
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="number"
                                                                value={editAmount}
                                                                onChange={(e) => setEditAmount(e.target.value)}
                                                                className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200 w-20"
                                                            />
                                                            <select
                                                                value={editCurrency}
                                                                onChange={(e) => setEditCurrency(e.target.value)}
                                                                className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200 w-20"
                                                            >
                                                                <option value="INR">INR</option>
                                                                <option value="USD">USD</option>
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-slate-200">
                                                            {row.currency === "USD" ? "$" : "₹"}{row.totalAmount}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editPayer}
                                                            onChange={(e) => setEditPayer(e.target.value)}
                                                            className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-slate-300">{row.payerEmail.split("@")[0]}</span>
                                                    )}
                                                </td>

                                                <td className="p-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editShared}
                                                            onChange={(e) => setEditShared(e.target.value)}
                                                            className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-200"
                                                        />
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">{row.sharedWith.split(";").map(s => s.split("@")[0]).join(", ")}</span>
                                                    )}
                                                </td>

                                                <td className="p-4 max-w-[250px]">
                                                    {anomalies.length === 0 ? (
                                                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                                            <CheckCircle2 size={13} /> Clean
                                                        </span>
                                                    ) : (
                                                        <div className="space-y-1.5">
                                                            {anomalies.map((a, idx) => (
                                                                <span key={idx} className="flex items-start gap-1 text-rose-400 font-semibold bg-rose-500/5 border border-rose-500/10 px-2 py-1 rounded-lg text-[10px]">
                                                                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                                                                    <span>{a.type}: {a.details}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="p-4 text-right whitespace-nowrap">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleSaveResolve(row.id)}
                                                                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 rounded border border-emerald-500/30"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setResolvingId(null)}
                                                                className="px-2.5 py-1 bg-slate-800 text-slate-350 rounded"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleResolveEdit(row)}
                                                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700"
                                                            >
                                                                Fix / Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleIgnoreRow(row.id)}
                                                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 rounded"
                                                            >
                                                                Ignore
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
