'use client';

import { useState } from 'react';

export function useDashboardFilters() {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedRT, setSelectedRT] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState('ALL');
  const [financeTypeFilter, setFinanceTypeFilter] = useState('ALL');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('ALL');
  const [assetConditionFilter, setAssetConditionFilter] = useState('ALL');
  const [assetOnlyDueFilter, setAssetOnlyDueFilter] = useState(false);
  const [reportsSubView, setReportsSubView] = useState<'generator' | 'kpi'>('generator');

  return {
    globalSearchQuery,
    setGlobalSearchQuery,
    selectedRT,
    setSelectedRT,
    selectedStatus,
    setSelectedStatus,
    financeCategoryFilter,
    setFinanceCategoryFilter,
    financeTypeFilter,
    setFinanceTypeFilter,
    assetCategoryFilter,
    setAssetCategoryFilter,
    assetConditionFilter,
    setAssetConditionFilter,
    assetOnlyDueFilter,
    setAssetOnlyDueFilter,
    reportsSubView,
    setReportsSubView,
  };
}
