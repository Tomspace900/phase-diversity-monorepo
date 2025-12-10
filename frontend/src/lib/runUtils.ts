import type { AnalysisRun } from "../types/session";

// ================================================================================
// TYPE DEFINITIONS
// ================================================================================

export interface RunNode {
  run: AnalysisRun;
  children: RunNode[];
  parent: RunNode | null;
  depth: number;
  borderColor: "green" | "yellow" | "red" | "default";
  chiSquaredDelta: number | null; // % change from parent
}

export interface RunFilters {
  searchTerm: string;
  status: "all" | "improved" | "degraded" | "neutral";
  minChiSquared: number | null;
  maxChiSquared: number | null;
  minRMS: number | null;
  maxRMS: number | null;
  minDuration: number | null;
  maxDuration: number | null;
  activeFlags: string[];
}

export type RunSortKey = "time" | "chi_squared" | "rms" | "duration";
export type RunSortOrder = "asc" | "desc";

export interface SessionStats {
  totalRuns: number;
  bestChiSquared: { value: number; runId: string } | null;
  bestRMS: { value: number; runId: string } | null;
  convergenceRate: number; // % of runs that improved from parent
  avgDuration: number; // seconds
}

// ================================================================================
// HIERARCHY BUILDING
// ================================================================================

/**
 * Build hierarchical tree from flat run array
 * - Creates parent/child relationships
 * - Calculates depth for indentation
 * - Computes border color based on Chi² comparison
 * - Complexity: O(n) using Map for lookups
 */
export function buildRunTree(runs: AnalysisRun[]): RunNode[] {
  const nodeMap = new Map<string, RunNode>();
  const roots: RunNode[] = [];

  // Phase 1: Create all nodes
  runs.forEach((run) => {
    nodeMap.set(run.id, {
      run,
      children: [],
      parent: null,
      depth: 0,
      borderColor: "default",
      chiSquaredDelta: null,
    });
  });

  // Phase 2: Build relationships & calculate metrics
  runs.forEach((run) => {
    const node = nodeMap.get(run.id)!;

    if (run.parent_run_id) {
      const parentNode = nodeMap.get(run.parent_run_id);

      if (parentNode) {
        node.parent = parentNode;
        node.depth = parentNode.depth + 1;
        parentNode.children.push(node);

        // Calculate Chi² delta and assign color
        const parentChi = getChiSquared(parentNode.run);
        const currentChi = getChiSquared(run);

        if (parentChi !== null && currentChi !== null) {
          node.chiSquaredDelta = ((currentChi - parentChi) / parentChi) * 100;
          node.borderColor = getRunBorderColor(node.chiSquaredDelta);
        }
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      // No parent, this is a root
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Flatten tree to array for rendering
 * Traverses tree depth-first to maintain parent-child order
 */
export function flattenRunTree(nodes: RunNode[]): RunNode[] {
  const result: RunNode[] = [];

  function traverse(node: RunNode) {
    result.push(node);
    node.children.forEach(traverse);
  }

  nodes.forEach(traverse);
  return result;
}

// ================================================================================
// CHI² CALCULATION
// ================================================================================

/**
 * Extract Chi² value from run
 * Chi² = sum of squared differences / number of pixels
 * Uses image_differences from backend response
 */
function getChiSquared(run: AnalysisRun): number | null {
  const { image_differences } = run.response.results;

  if (!image_differences || image_differences.length === 0) return null;

  let sumSquaredDiff = 0;
  let totalPixels = 0;

  image_differences.forEach((diff) => {
    diff.forEach((row) => {
      row.forEach((val) => {
        sumSquaredDiff += val * val;
        totalPixels++;
      });
    });
  });

  return totalPixels > 0 ? sumSquaredDiff / totalPixels : null;
}

/**
 * Determine border color based on Chi² change from parent
 * - Green: Improved (< -5%)
 * - Yellow: Neutral (-5% to +5%)
 * - Red: Degraded (> +5%)
 */
function getRunBorderColor(
  chiSquaredDelta: number
): "green" | "yellow" | "red" {
  if (chiSquaredDelta < -5) return "green";
  if (chiSquaredDelta > 5) return "red";
  return "yellow";
}

// ================================================================================
// FILTERING
// ================================================================================

/**
 * Filter runs based on criteria
 * Applies search, status, metrics, and flags filters
 */
export function filterRuns(
  nodes: RunNode[],
  filters: RunFilters
): RunNode[] {
  return nodes.filter((node) => {
    const { run, chiSquaredDelta } = node;

    // Search term (match against timestamp)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const timestamp = new Date(run.timestamp).toLocaleString().toLowerCase();
      if (!timestamp.includes(term)) return false;
    }

    // Status filter
    if (filters.status !== "all") {
      if (chiSquaredDelta === null) return false;

      if (filters.status === "improved" && chiSquaredDelta >= -5) return false;
      if (filters.status === "degraded" && chiSquaredDelta <= 5) return false;
      if (
        filters.status === "neutral" &&
        (chiSquaredDelta < -5 || chiSquaredDelta > 5)
      )
        return false;
    }

    // Chi² range
    const chi = getChiSquared(run);
    if (chi !== null) {
      if (filters.minChiSquared !== null && chi < filters.minChiSquared)
        return false;
      if (filters.maxChiSquared !== null && chi > filters.maxChiSquared)
        return false;
    }

    // RMS range
    const rms = run.response.results.rms_stats.weighted_notiltdef;
    if (filters.minRMS !== null && rms < filters.minRMS) return false;
    if (filters.maxRMS !== null && rms > filters.maxRMS) return false;

    // Duration range
    const duration = run.response.duration_ms / 1000;
    if (filters.minDuration !== null && duration < filters.minDuration)
      return false;
    if (filters.maxDuration !== null && duration > filters.maxDuration)
      return false;

    // Active flags filter
    if (filters.activeFlags.length > 0) {
      const runFlags = Object.entries(run.flags)
        .filter(([, value]) => typeof value === "boolean" && value)
        .map(([key]) => key);

      const hasAllFlags = filters.activeFlags.every((flag) =>
        runFlags.includes(flag)
      );
      if (!hasAllFlags) return false;
    }

    return true;
  });
}

// ================================================================================
// SORTING
// ================================================================================

/**
 * Sort runs by specified key and order
 */
export function sortRuns(
  nodes: RunNode[],
  key: RunSortKey,
  order: RunSortOrder
): RunNode[] {
  const sorted = [...nodes].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    switch (key) {
      case "time":
        aVal = new Date(a.run.timestamp).getTime();
        bVal = new Date(b.run.timestamp).getTime();
        break;
      case "chi_squared":
        aVal = getChiSquared(a.run) ?? Infinity;
        bVal = getChiSquared(b.run) ?? Infinity;
        break;
      case "rms":
        aVal = a.run.response.results.rms_stats.weighted_notiltdef;
        bVal = b.run.response.results.rms_stats.weighted_notiltdef;
        break;
      case "duration":
        aVal = a.run.response.duration_ms;
        bVal = b.run.response.duration_ms;
        break;
    }

    return order === "asc" ? aVal - bVal : bVal - aVal;
  });

  return sorted;
}

// ================================================================================
// SESSION STATISTICS
// ================================================================================

/**
 * Calculate session-level statistics
 * - Total runs
 * - Best Chi² (lowest value)
 * - Best RMS (lowest value)
 * - Convergence rate (% of runs that improved from parent)
 * - Average duration
 */
export function calculateSessionStats(runs: AnalysisRun[]): SessionStats {
  if (runs.length === 0) {
    return {
      totalRuns: 0,
      bestChiSquared: null,
      bestRMS: null,
      convergenceRate: 0,
      avgDuration: 0,
    };
  }

  let bestChi: { value: number; runId: string } | null = null;
  let bestRMS: { value: number; runId: string } | null = null;
  let improvedCount = 0;
  let totalWithParent = 0;
  let totalDuration = 0;

  const tree = buildRunTree(runs);
  const flatNodes = flattenRunTree(tree);

  flatNodes.forEach((node) => {
    const { run, chiSquaredDelta } = node;

    // Track best Chi²
    const chi = getChiSquared(run);
    if (chi !== null && (bestChi === null || chi < bestChi.value)) {
      bestChi = { value: chi, runId: run.id };
    }

    // Track best RMS
    const rms = run.response.results.rms_stats.weighted_notiltdef;
    if (bestRMS === null || rms < bestRMS.value) {
      bestRMS = { value: rms, runId: run.id };
    }

    // Track convergence rate
    if (node.parent !== null) {
      totalWithParent++;
      if (chiSquaredDelta !== null && chiSquaredDelta < 0) {
        improvedCount++;
      }
    }

    // Track duration
    totalDuration += run.response.duration_ms;
  });

  return {
    totalRuns: runs.length,
    bestChiSquared: bestChi,
    bestRMS: bestRMS,
    convergenceRate:
      totalWithParent > 0 ? (improvedCount / totalWithParent) * 100 : 0,
    avgDuration: totalDuration / runs.length / 1000, // Convert to seconds
  };
}
