import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, User, Save, Edit2, X } from "lucide-react";

export default function GroupMembershipsTab({ groupId }) {
    const [memberships, setMemberships] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [joinDate, setJoinDate] = useState("");
    const [leaveDate, setLeaveDate] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchMemberships = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/family/${groupId}/memberships`);
            setMemberships(res.data || []);
        } catch (err) {
            console.error("Error fetching memberships:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemberships();
    }, [groupId]);

    const handleEdit = (m) => {
        setEditingId(m.id);
        setJoinDate(m.joinedDate || "");
        setLeaveDate(m.leftDate || "");
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleSave = async (membershipId) => {
        try {
            await axios.put(`http://localhost:8080/family/${groupId}/memberships/${membershipId}`, {
                joinedDate: joinDate,
                leftDate: leaveDate || null
            });
            setEditingId(null);
            fetchMemberships();
        } catch (err) {
            console.error("Error saving membership dates:", err);
            alert("Failed to save membership dates");
        }
    };

    if (loading) {
        return <div className="text-center py-6 text-slate-400">Loading memberships...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Membership Timeline History</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Control when members moved in and out. This determines which expenses affect their balances (e.g. Sam's mid-April start).
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {memberships.map((m) => {
                    const isEditing = editingId === m.id;
                    return (
                        <div key={m.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                    {m.profileIcon || "👤"}
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-200">{m.email.split("@")[0]}</h4>
                                    <p className="text-xs text-slate-500">{m.email}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Joined Date</label>
                                        <input
                                            type="date"
                                            value={joinDate}
                                            onChange={(e) => setJoinDate(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Left Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={leaveDate}
                                            onChange={(e) => setLeaveDate(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleSave(m.id)}
                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all"
                                            title="Save"
                                        >
                                            <Save size={16} />
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                                            title="Cancel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Calendar size={14} className="text-indigo-400" />
                                            <span>Joined: <b>{m.joinedDate || "N/A"}</b></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-350">
                                            <Calendar size={14} className="text-rose-400" />
                                            <span>Left: <b>{m.leftDate || "Still active"}</b></span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEdit(m)}
                                        className="flex items-center gap-1 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-750 text-slate-300 transition-all"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
