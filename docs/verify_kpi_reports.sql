-- Verify 200 KPI Reports were created
SELECT 
  category,
  COUNT(*) as report_count
FROM kpi_reports 
WHERE is_global = true 
GROUP BY category 
ORDER BY category;

-- Total count
SELECT COUNT(*) as total_global_reports FROM kpi_reports WHERE is_global = true;

-- Sample reports
SELECT name, kpi_codes, category FROM kpi_reports WHERE is_global = true LIMIT 10;
