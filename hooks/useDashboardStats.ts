'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfficialLetter, MeetingMinutes } from '@/types/letter';
import { Jamaah, JamaahStats } from '@/types/jamaah';
import { FinanceTransaction, FinanceSummary } from '@/types/finance';
import { DonorItem, DonorStats } from '@/types/donor';
import { AssetItem, AssetStats } from '@/types/asset';
import { LPJReport, FieldKPI, ApprovalItem } from '@/types/reports';

export function useDashboardStats() {
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [jamaahList, setJamaahList] = useState<Jamaah[]>([]);
  const [jamaahStats, setJamaahStats] = useState<JamaahStats | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [kpis, setKpis] = useState<FieldKPI[]>([]);
  // Prioritas 5: overallScore default null sampai data KPI selesai di-fetch
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [overallGrade, setOverallGrade] = useState<string>('Sangat Baik');
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [lpjReport, setLpjReport] = useState<LPJReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Re-fetch individual callbacks for actions
  const fetchLetters = useCallback(async () => {
    try {
      const res = await fetch('/api/letters');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setLetters(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch letters:', err);
    }
  }, []);

  const fetchMinutes = useCallback(async () => {
    try {
      const res = await fetch('/api/minutes');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setMinutes(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch minutes:', err);
    }
  }, []);

  const fetchJamaah = useCallback(async () => {
    try {
      const res = await fetch('/api/jamaah');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.data) setJamaahList(json.data);
          if (json.stats) setJamaahStats(json.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jamaah:', err);
    }
  }, []);

  const fetchFinance = useCallback(async () => {
    try {
      const res = await fetch('/api/finance');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.data) setTransactions(json.data);
          if (json.summary) setFinanceSummary(json.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch finance:', err);
    }
  }, []);

  const fetchDonors = useCallback(async () => {
    try {
      const res = await fetch('/api/donors');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.data) setDonors(json.data);
          if (json.stats) setDonorStats(json.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.data) setAssets(json.data);
          if (json.stats) setAssetStats(json.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const [resKpi, resLpj] = await Promise.all([
        fetch('/api/reports/kpi'),
        fetch('/api/reports/lpj'),
      ]);

      if (resKpi.ok) {
        const kpiData = await resKpi.json();
        if (kpiData.success && kpiData.kpis) {
          setKpis(kpiData.kpis);
          if (typeof kpiData.overallScore === 'number') {
            setOverallScore(kpiData.overallScore);
          }
          if (kpiData.overallGrade) {
            setOverallGrade(kpiData.overallGrade);
          }
        }
      }

      if (resLpj.ok) {
        const lpjData = await resLpj.json();
        if (lpjData.success && lpjData.report) {
          setLpjReport(lpjData.report);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  }, []);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setApprovals(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        fetchLetters(),
        fetchMinutes(),
        fetchJamaah(),
        fetchFinance(),
        fetchDonors(),
        fetchAssets(),
        fetchReports(),
        fetchApprovals(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchLetters,
    fetchMinutes,
    fetchJamaah,
    fetchFinance,
    fetchDonors,
    fetchAssets,
    fetchReports,
    fetchApprovals,
  ]);

  // Initial load inside effect using async subscriber pattern
  useEffect(() => {
    let isCancelled = false;

    async function loadInitialData() {
      try {
        const [
          resLtr,
          resMin,
          resJmh,
          resFin,
          resDnr,
          resAst,
          resKpi,
          resLpj,
          resApp,
        ] = await Promise.allSettled([
          fetch('/api/letters').then((r) => r.json()),
          fetch('/api/minutes').then((r) => r.json()),
          fetch('/api/jamaah').then((r) => r.json()),
          fetch('/api/finance').then((r) => r.json()),
          fetch('/api/donors').then((r) => r.json()),
          fetch('/api/assets').then((r) => r.json()),
          fetch('/api/reports/kpi').then((r) => r.json()),
          fetch('/api/reports/lpj').then((r) => r.json()),
          fetch('/api/approvals').then((r) => r.json()),
        ]);

        if (isCancelled) return;

        if (resLtr.status === 'fulfilled' && resLtr.value?.success && resLtr.value.data) {
          setLetters(resLtr.value.data);
        }
        if (resMin.status === 'fulfilled' && resMin.value?.success && resMin.value.data) {
          setMinutes(resMin.value.data);
        }
        if (resJmh.status === 'fulfilled' && resJmh.value?.success) {
          if (resJmh.value.data) setJamaahList(resJmh.value.data);
          if (resJmh.value.stats) setJamaahStats(resJmh.value.stats);
        }
        if (resFin.status === 'fulfilled' && resFin.value?.success) {
          if (resFin.value.data) setTransactions(resFin.value.data);
          if (resFin.value.summary) setFinanceSummary(resFin.value.summary);
        }
        if (resDnr.status === 'fulfilled' && resDnr.value?.success) {
          if (resDnr.value.data) setDonors(resDnr.value.data);
          if (resDnr.value.stats) setDonorStats(resDnr.value.stats);
        }
        if (resAst.status === 'fulfilled' && resAst.value?.success) {
          if (resAst.value.data) setAssets(resAst.value.data);
          if (resAst.value.stats) setAssetStats(resAst.value.stats);
        }
        if (resKpi.status === 'fulfilled' && resKpi.value?.success) {
          if (resKpi.value.kpis) setKpis(resKpi.value.kpis);
          if (typeof resKpi.value.overallScore === 'number') {
            setOverallScore(resKpi.value.overallScore);
          }
          if (resKpi.value.overallGrade) {
            setOverallGrade(resKpi.value.overallGrade);
          }
        }
        if (resLpj.status === 'fulfilled' && resLpj.value?.success && resLpj.value.report) {
          setLpjReport(resLpj.value.report);
        }
        if (resApp.status === 'fulfilled' && resApp.value?.success && resApp.value.data) {
          setApprovals(resApp.value.data);
        }
      } catch (err) {
        console.error('Error fetching initial dashboard stats:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Calculated properties
  const totalLetters = letters.length;
  const approvedCount = letters.filter((l) => l.status === 'APPROVED' || l.status === 'SENT').length;
  const invitationCount = letters.filter((l) => l.category === 'UND').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'MENUNGGU_VERIFIKASI').length;
  const totalActiveTasks = minutes.reduce(
    (sum, m) => sum + (m.actionItems ? m.actionItems.filter((a) => a.status !== 'COMPLETED').length : 0),
    0
  );

  return {
    // Data
    letters,
    setLetters,
    minutes,
    jamaahList,
    jamaahStats,
    transactions,
    financeSummary,
    donors,
    donorStats,
    assets,
    assetStats,
    kpis,
    overallScore,
    overallGrade,
    approvals,
    lpjReport,

    // Counters
    totalLetters,
    approvedCount,
    invitationCount,
    pendingApprovalsCount,
    totalActiveTasks,

    // Status
    isLoading,

    // Refetchers
    refreshAll,
    fetchLetters,
    fetchMinutes,
    fetchJamaah,
    fetchFinance,
    fetchDonors,
    fetchAssets,
    fetchReports,
    fetchApprovals,
  };
}
