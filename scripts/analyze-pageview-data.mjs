import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const csvPath = join(import.meta.dirname, 'harper-docs-analytics.csv');

const dataRaw = readFileSync(csvPath, 'utf8');

const data = dataRaw.split('\r\n').slice(9); // remove first 9 lines

// Safe to naively parse CSV since:
// - there are no `,` characters within the header text
data.shift(); // Remove header row
// - nor are there `,` characters within any of the data values
const records = data.map(row => row.split(','));

// Parse records into objects with typed values
const pages = records
  .filter(row => row.length >= 2 && row[0]) // Filter out empty rows
  .map(row => ({
    path: row[0],
    views: parseInt(row[1]) || 0,
    activeUsers: parseInt(row[2]) || 0,
  }));

// Analysis Functions

function getTotalViews() {
  return pages.reduce((sum, page) => sum + page.views, 0);
}

function getPathCount() {
  return pages.length;
}

function getViewsByRootPath() {
  const rootPaths = {};
  pages.forEach(page => {
    const parts = page.path.split('/').filter(Boolean);
    const root = parts[0] || 'root';
    if (!rootPaths[root]) {
      rootPaths[root] = { views: 0, paths: 0 };
    }
    rootPaths[root].views += page.views;
    rootPaths[root].paths += 1;
  });
  return rootPaths;
}

function getTopPagesByViews(n) {
  return [...pages].sort((a, b) => b.views - a.views).slice(0, n);
}

function getCumulativeViewPercentages() {
  const sorted = [...pages].sort((a, b) => b.views - a.views);
  const totalViews = getTotalViews();
  const percentages = [];
  let cumulative = 0;

  sorted.forEach((page, index) => {
    cumulative += page.views;
    const percentage = (cumulative / totalViews) * 100;
    percentages.push({
      rank: index + 1,
      path: page.path,
      views: page.views,
      cumulativeViews: cumulative,
      cumulativePercentage: percentage,
    });
  });

  return percentages;
}

function findCoverageThresholds(percentages) {
  const thresholds = [50, 75, 80, 90, 95, 99];
  const results = [];

  thresholds.forEach(threshold => {
    const index = percentages.findIndex(p => p.cumulativePercentage >= threshold);
    if (index !== -1) {
      results.push({
        percentage: threshold,
        pathCount: index + 1,
        totalPaths: pages.length,
        pathPercentage: ((index + 1) / pages.length * 100).toFixed(2),
      });
    }
  });

  return results;
}

// Output Functions

function printTotalStats() {
  console.log('Total Statistics');
  console.log('Overview of the entire dataset');
  console.log('Results:');
  console.log(`  Total Paths: ${getPathCount().toLocaleString()}`);
  console.log(`  Total Views: ${getTotalViews().toLocaleString()}`);
  console.log(`  Average Views per Path: ${(getTotalViews() / getPathCount()).toFixed(2)}`);
  console.log();
}

function printTopPages(n = 20) {
  const top = getTopPagesByViews(n);
  const totalViews = getTotalViews();

  console.log(`Top ${n} Pages by Views`);
  console.log(`The most viewed pages and their contribution to total site views`);
  console.log('Results:');
  top.forEach((page, index) => {
    const percentage = (page.views / totalViews * 100).toFixed(2);
    console.log(`  ${(index + 1).toString().padStart(2)}. ${page.path}`);
    console.log(`      ${page.views.toLocaleString()} views (${percentage}%)`);
  });
  console.log();
}

function printRootPathAnalysis() {
  const rootPaths = getViewsByRootPath();
  const totalViews = getTotalViews();
  const mainPaths = ['docs', 'release-notes', 'fabric', 'learn'];

  console.log('Views by Root Path');
  console.log('Distribution of views across top-level paths');
  console.log('Results:');

  // Display main paths
  mainPaths.forEach(root => {
    const stats = rootPaths[root];
    if (stats) {
      const percentage = (stats.views / totalViews * 100).toFixed(2);
      console.log(`  /${root}`);
      console.log(`    Views: ${stats.views.toLocaleString()} (${percentage}%)`);
      console.log(`    Paths: ${stats.paths.toLocaleString()}`);
      console.log(`    Avg Views/Path: ${(stats.views / stats.paths).toFixed(2)}`);
    }
  });

  // List other root paths
  const otherRoots = Object.keys(rootPaths)
    .filter(root => !mainPaths.includes(root))
    .sort((a, b) => rootPaths[b].views - rootPaths[a].views);

  if (otherRoots.length > 0) {
    console.log('  Other root paths:');
    otherRoots.forEach(root => {
      const stats = rootPaths[root];
      const percentage = (stats.views / totalViews * 100).toFixed(2);
      console.log(`    /${root}: ${stats.views.toLocaleString()} views (${percentage}%), ${stats.paths} paths`);
    });
  }

  console.log();
}

function printCoverageThresholds() {
  const percentages = getCumulativeViewPercentages();
  const thresholds = findCoverageThresholds(percentages);

  console.log('Coverage Analysis');
  console.log('How many paths account for X% of total views');
  console.log('Results:');
  thresholds.forEach(threshold => {
    console.log(`  ${threshold.percentage}% of views: ${threshold.pathCount} paths (${threshold.pathPercentage}% of all paths)`);
  });
  console.log();
}

function printViewCountDistribution() {
  const totalViews = getTotalViews();
  const totalPaths = pages.length;

  // Create ranges for high traffic
  const highTrafficRanges = [];
  for (let i = 100; i < 10000; i += 50) {
    highTrafficRanges.push({ min: i, max: i + 49 });
  }

  // Calculate stats for each category
  const highTrafficPaths = pages.filter(p => p.views >= 100);
  const mediumTrafficPaths = pages.filter(p => p.views >= 10 && p.views < 100);
  const lowTrafficPaths = pages.filter(p => p.views >= 1 && p.views < 10);
  const zeroTrafficPaths = pages.filter(p => p.views === 0);

  const highTrafficViews = highTrafficPaths.reduce((sum, p) => sum + p.views, 0);
  const mediumTrafficViews = mediumTrafficPaths.reduce((sum, p) => sum + p.views, 0);
  const lowTrafficViews = lowTrafficPaths.reduce((sum, p) => sum + p.views, 0);

  console.log('View Count Distribution');
  console.log('Number of paths grouped by their view count');
  console.log('Results:');

  // High traffic breakdown
  console.log('  High traffic (100+ views):');
  console.log(`    Total Paths: ${highTrafficPaths.length} (${(highTrafficPaths.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log(`    Total Views: ${highTrafficViews.toLocaleString()} (${(highTrafficViews / totalViews * 100).toFixed(2)}% of views)`);
  console.log(`    Breakdown by range:`);

  highTrafficRanges.forEach(range => {
    const pathsInRange = highTrafficPaths.filter(p => p.views >= range.min && p.views <= range.max);
    if (pathsInRange.length > 0) {
      const viewsInRange = pathsInRange.reduce((sum, p) => sum + p.views, 0);
      console.log(`      ${range.min}-${range.max} views: ${pathsInRange.length} paths (${viewsInRange.toLocaleString()} views)`);
    }
  });

  // Medium traffic
  console.log('  Medium traffic (10-99 views):');
  console.log(`    Total Paths: ${mediumTrafficPaths.length} (${(mediumTrafficPaths.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log(`    Total Views: ${mediumTrafficViews.toLocaleString()} (${(mediumTrafficViews / totalViews * 100).toFixed(2)}% of views)`);

  // Low traffic
  console.log('  Low traffic (1-9 views):');
  console.log(`    Total Paths: ${lowTrafficPaths.length} (${(lowTrafficPaths.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log(`    Total Views: ${lowTrafficViews.toLocaleString()} (${(lowTrafficViews / totalViews * 100).toFixed(2)}% of views)`);

  // Zero views
  console.log('  Zero views:');
  console.log(`    Total Paths: ${zeroTrafficPaths.length} (${(zeroTrafficPaths.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log();
}

function printLongTailAnalysis() {
  const sorted = [...pages].sort((a, b) => b.views - a.views);
  const totalViews = getTotalViews();
  const totalPaths = pages.length;

  console.log('Long Tail Analysis');
  console.log('Understanding the distribution of low-traffic pages');
  console.log('Results:');

  const singleDigitViews = sorted.filter(p => p.views < 10 && p.views > 0);
  const singleDigitViewsTotal = singleDigitViews.reduce((sum, p) => sum + p.views, 0);
  const singleDigitPercentage = (singleDigitViewsTotal / totalViews * 100).toFixed(2);

  console.log(`  Paths with 1-9 views:`);
  console.log(`    Count: ${singleDigitViews.length} (${(singleDigitViews.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log(`    Total Views: ${singleDigitViewsTotal.toLocaleString()} (${singleDigitPercentage}% of total views)`);

  const zeroViews = sorted.filter(p => p.views === 0);
  console.log(`  Paths with 0 views:`);
  console.log(`    Count: ${zeroViews.length} (${(zeroViews.length / totalPaths * 100).toFixed(2)}% of paths)`);
  console.log();
}

function printRedirectStrategyData() {
  const percentages = getCumulativeViewPercentages();
  const totalPaths = pages.length;

  console.log('Redirect Strategy Quick Reference');
  console.log('Key data points for redirect planning');
  console.log('Results:');

  [10, 25, 50, 100, 200].forEach(n => {
    if (n <= totalPaths) {
      const data = percentages[n - 1];
      const percentage = data.cumulativePercentage.toFixed(2);
      console.log(`  Top ${n} paths: ${percentage}% of views`);
    }
  });
  console.log();
}

// Run all analyses
console.log('Harper Docs Analytics Report');
console.log('Data Period: October 21, 2025 - February 4, 2026');
console.log();
console.log('═'.repeat(80));
console.log();

printTotalStats();
printCoverageThresholds();
printRedirectStrategyData();
printTopPages(25);
printRootPathAnalysis();
printViewCountDistribution();
printLongTailAnalysis();