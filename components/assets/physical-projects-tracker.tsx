'use client';

import React, { useState } from 'react';
import {
  Hammer,
  Calendar,
  UserCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PhysicalProjectItem, ProjectStatus } from '@/types/project';
import { INITIAL_PHYSICAL_PROJECTS } from '@/lib/mock-projects';
import { useAuth } from '@/lib/auth-context';

export default function PhysicalProjectsTracker() {
  const { isReadOnly } = useAuth();
  const [projects, setProjects] = useState<PhysicalProjectItem[]>(INITIAL_PHYSICAL_PROJECTS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>('prj-001');

  // Edit Progress Modal
  const [editingProject, setEditingProject] = useState<PhysicalProjectItem | null>(null);
  const [editPercentage, setEditPercentage] = useState<number>(0);
  const [editRealized, setEditRealized] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<ProjectStatus>('DALAM_PENGERJAAN');

  // Calculated Stats
  const totalAllocated = projects.reduce((acc, p) => acc + p.allocatedBudget, 0);
  const totalRealized = projects.reduce((acc, p) => acc + p.realizedBudget, 0);
  const averageProgress = Math.round(
    projects.reduce((acc, p) => acc + p.progressPercentage, 0) / projects.length
  );
  const completedProjectsCount = projects.filter((p) => p.status === 'SELESAI').length;

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    if (isReadOnly) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedMilestones = proj.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isDone: !m.isDone } : m
        );
        // Recalculate progress based on done milestones
        const doneCount = updatedMilestones.filter((m) => m.isDone).length;
        const autoProgress = Math.round((doneCount / updatedMilestones.length) * 100);
        return {
          ...proj,
          milestones: updatedMilestones,
          progressPercentage: autoProgress,
          status: autoProgress === 100 ? 'SELESAI' : 'DALAM_PENGERJAAN',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              progressPercentage: editPercentage,
              realizedBudget: editRealized,
              status: editStatus,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setEditingProject(null);
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner Proyek Fisik Raker 2026 */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-7 text-white shadow-soft-md border border-amber-500/20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2.5">
            <Hammer className="w-3.5 h-3.5 text-amber-400" />
            <span>Komisi II Raker 2026 — Bidang Pembangunan & Sarana Prasarana</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tracker Proyek Pembangunan & Renovasi Fisik
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pengawasan realisasi fisik dan serapan anggaran untuk 5 proyek strategis hasil Sidang Pleno Raker 2026:
            Renovasi Plafon Lantai 2 (Rp 350 Juta), Menara Masjid 30M (Rp 1.55 Milyar), Saluran Drainase (Rp 150 Juta),
            AC Daikin (Rp 27 Juta), dan Modul Otomatis Genset (Rp 3.5 Juta).
          </p>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-amber-300 font-semibold block">Total Pagu Disahkan</span>
            <span className="text-lg font-extrabold text-white">
              Rp {(totalAllocated / 1000000000).toFixed(2)} Milyar
            </span>
          </div>
          <div>
            <span className="text-[11px] text-teal-300 font-semibold block">Dana Terserap Riil</span>
            <span className="text-lg font-extrabold text-white">
              Rp {(totalRealized / 1000000).toFixed(1)} Juta
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-300 font-semibold block">Rata-Rata Progres Fisik</span>
            <span className="text-lg font-extrabold text-amber-400">{averageProgress}% Selesai</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-300 font-semibold block">Status Selesai 100%</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {completedProjectsCount} dari {projects.length} Proyek
            </span>
          </div>
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
            {[
              { id: 'ALL', label: `Semua (${projects.length})` },
              { id: 'DALAM_PENGERJAAN', label: `Sedang Berjalan (${projects.filter((p) => p.status === 'DALAM_PENGERJAAN').length})` },
              { id: 'SELESAI', label: `Selesai 100% (${projects.filter((p) => p.status === 'SELESAI').length})` },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          PJ Sarpras: <strong>Faisal T. Parussengi, S.S.</strong> • Supervisi: <strong>H. Muh. Nancha Pattanang, S.E.</strong>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const percentage = project.progressPercentage;
          const budgetUsedPercent = Math.round((project.realizedBudget / project.allocatedBudget) * 100);

          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden transition-all hover:shadow-soft-md"
            >
              {/* Card Header & Progress Bar */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {project.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          project.urgencyLevel === 'MENDESAK'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {project.urgencyLevel}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          project.status === 'SELESAI'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {project.status === 'SELESAI' ? 'TUNTAS 100%' : 'DALAM PENGERJAAN'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Actions & Milestone Expand Toggle */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setEditPercentage(project.progressPercentage);
                          setEditRealized(project.realizedBudget);
                          setEditStatus(project.status);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        Update Progres
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>Milestone</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Progress Indicators Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span>Progres Fisik Lapangan</span>
                    </span>
                    <span className="text-amber-700 font-extrabold text-sm">{percentage}% Selesai</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage === 100
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Financial Pagu vs Realisasi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium block">Pagu Anggaran Raker:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Rp {project.allocatedBudget.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/60">
                    <span className="text-[11px] text-teal-700 font-medium block">Realisasi Dana Terserap:</span>
                    <span className="font-extrabold text-teal-900 text-sm">
                      Rp {project.realizedBudget.toLocaleString('id-ID')} ({budgetUsedPercent}%)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 font-medium block">Pelaksana / Vendor:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {project.contractorVendor || 'Swakelola DKM'}
                    </span>
                  </div>
                </div>

                {/* Metadata Dates & PJ */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jadwal: {project.startDate} s.d. {project.targetEndDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Penanggung Jawab: {project.responsiblePerson}</span>
                  </div>
                </div>
              </div>

              {/* Milestones Accordion */}
              {isExpanded && (
                <div className="bg-slate-50/80 p-5 border-t border-slate-200/80 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Tahapan Pekerjaan & Milestones ({project.milestones.filter((m) => m.isDone).length}/{project.milestones.length})
                    </h4>
                    {!isReadOnly && (
                      <span className="text-[11px] text-slate-400 italic">
                        Klik checkbox untuk menandai tahapan selesai
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {project.milestones.map((m) => (
                      <label
                        key={m.id}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleMilestone(project.id, m.id);
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          m.isDone
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        } ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <input
                          type="checkbox"
                          checked={m.isDone}
                          readOnly
                          className="mt-0.5 rounded text-teal-700 pointer-events-none"
                        />
                        <div className="flex-1 text-xs">
                          <span className={m.isDone ? 'line-through text-slate-500' : ''}>
                            {m.title}
                          </span>
                          {m.targetDate && (
                            <span className="ml-2 text-[10px] text-slate-400">
                              (Target: {m.targetDate})
                            </span>
                          )}
                        </div>
                        {m.isDone && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                            Selesai
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {project.notes && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                      <strong>Catatan Khusus:</strong> {project.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Update Progres */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-amber-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Update Progres Proyek Fisik</h3>
                <p className="text-xs text-amber-200">{editingProject.title}</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-amber-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persentase Progres Fisik: <strong className="text-amber-700">{editPercentage}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editPercentage}
                  onChange={(e) => setEditPercentage(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Realisasi Dana Terserap (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={editRealized}
                  onChange={(e) => setEditRealized(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pagu Raker: Rp {editingProject.allocatedBudget.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pengerjaan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="PERENCANAAN">PERENCANAAN</option>
                  <option value="TENDER_VENDOR">TENDER_VENDOR</option>
                  <option value="DALAM_PENGERJAAN">DALAM_PENGERJAAN</option>
                  <option value="SELESAI">SELESAI (100% Tuntas)</option>
                  <option value="TERTUNDA">TERTUNDA</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
