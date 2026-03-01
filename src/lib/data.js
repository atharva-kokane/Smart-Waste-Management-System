// Smart City Dashboard Mock Data

export const summaryCards = {
  totalBins: 1248,
  filledBins: 312,
  emptyBins: 784,
  criticalBins: 52,
  currentAQI: 78,
  pollutionStatus: "Moderate",
  activePredictions: 24,
  activeAutomations: 18,
}

export const binData = [
  { id: "BIN-001", location: "Main St & 5th Ave", fillLevel: 92, status: "Critical", lastUpdated: "2 min ago" },
  { id: "BIN-002", location: "Central Park East", fillLevel: 75, status: "Full", lastUpdated: "5 min ago" },
  { id: "BIN-003", location: "City Hall Plaza", fillLevel: 45, status: "Medium", lastUpdated: "8 min ago" },
  { id: "BIN-004", location: "Harbor District", fillLevel: 12, status: "Empty", lastUpdated: "3 min ago" },
  { id: "BIN-005", location: "University Campus", fillLevel: 88, status: "Critical", lastUpdated: "1 min ago" },
  { id: "BIN-006", location: "Market Square", fillLevel: 34, status: "Medium", lastUpdated: "10 min ago" },
  { id: "BIN-007", location: "Railway Station", fillLevel: 67, status: "Full", lastUpdated: "4 min ago" },
  { id: "BIN-008", location: "Business Park", fillLevel: 8, status: "Empty", lastUpdated: "15 min ago" },
  { id: "BIN-009", location: "Waterfront Promenade", fillLevel: 95, status: "Critical", lastUpdated: "1 min ago" },
  { id: "BIN-010", location: "Tech District", fillLevel: 55, status: "Medium", lastUpdated: "6 min ago" },
]

export const pollutantData = [
  { name: "PM2.5", value: 35.2, unit: "ug/m3", status: "Moderate", limit: 60 },
  { name: "PM10", value: 58.4, unit: "ug/m3", status: "Moderate", limit: 100 },
  { name: "CO", value: 1.2, unit: "mg/m3", status: "Good", limit: 4 },
  { name: "NO2", value: 42.1, unit: "ug/m3", status: "Moderate", limit: 80 },
  { name: "SO2", value: 8.3, unit: "ug/m3", status: "Good", limit: 40 },
]

export const aqiTrendData = [
  { time: "00:00", aqi: 45 },
  { time: "02:00", aqi: 42 },
  { time: "04:00", aqi: 38 },
  { time: "06:00", aqi: 52 },
  { time: "08:00", aqi: 75 },
  { time: "10:00", aqi: 82 },
  { time: "12:00", aqi: 78 },
  { time: "14:00", aqi: 85 },
  { time: "16:00", aqi: 72 },
  { time: "18:00", aqi: 68 },
  { time: "20:00", aqi: 55 },
  { time: "22:00", aqi: 48 },
]

export const areaPollutionData = [
  { area: "Downtown Core", aqi: 95, status: "Moderate", pm25: 42.1, pm10: 68.3 },
  { area: "Industrial Zone", aqi: 142, status: "Poor", pm25: 72.5, pm10: 115.2 },
  { area: "Residential North", aqi: 52, status: "Good", pm25: 18.3, pm10: 35.1 },
  { area: "Harbor District", aqi: 78, status: "Moderate", pm25: 35.2, pm10: 58.4 },
  { area: "Tech Park", aqi: 45, status: "Good", pm25: 12.8, pm10: 28.5 },
  { area: "University Area", aqi: 38, status: "Good", pm25: 10.2, pm10: 22.3 },
]

export const wasteTrendData = [
  { day: "Mon", collected: 245, generated: 280 },
  { day: "Tue", collected: 312, generated: 295 },
  { day: "Wed", collected: 278, generated: 310 },
  { day: "Thu", collected: 355, generated: 340 },
  { day: "Fri", collected: 390, generated: 380 },
  { day: "Sat", collected: 220, generated: 260 },
  { day: "Sun", collected: 185, generated: 210 },
]

export const aiPredictions = [
  { id: 1, type: "Waste Fill", prediction: "BIN-009 will reach capacity in 2 hours", confidence: 94, severity: "high" },
  { id: 2, type: "Air Quality", prediction: "AQI expected to improve by evening", confidence: 87, severity: "medium" },
  { id: 3, type: "Waste Fill", prediction: "Downtown bins 80% full by 3 PM", confidence: 91, severity: "high" },
  { id: 4, type: "Air Quality", prediction: "Industrial zone PM2.5 spike at noon", confidence: 82, severity: "high" },
  { id: 5, type: "Waste Fill", prediction: "Harbor District collection optimal at 6 AM", confidence: 88, severity: "low" },
]

export const aiInsights = [
  { id: 1, category: "Optimization", message: "Route optimization can reduce collection time by 18%", priority: "medium" },
  { id: 2, category: "Risk Alert", message: "3 bins in Central Park approaching critical levels simultaneously", priority: "high" },
  { id: 3, category: "Recommendation", message: "Deploy additional bins near Railway Station due to increased foot traffic", priority: "medium" },
  { id: 4, category: "Risk Alert", message: "Industrial zone air quality degrading - consider traffic diversion", priority: "high" },
  { id: 5, category: "Optimization", message: "Weekend collection schedule can be reduced by 25%", priority: "low" },
]

export const automationWorkflows = [
  { id: 1, name: "Bin Full Alert", status: "Active", lastRun: "2 min ago", runs: 342, successRate: 99.1 },
  { id: 2, name: "AQI Threshold Notification", status: "Active", lastRun: "15 min ago", runs: 128, successRate: 97.5 },
  { id: 3, name: "Daily Report Generator", status: "Active", lastRun: "6 hours ago", runs: 89, successRate: 100 },
  { id: 4, name: "Route Optimizer", status: "Inactive", lastRun: "2 days ago", runs: 45, successRate: 95.2 },
  { id: 5, name: "Emergency Response Trigger", status: "Active", lastRun: "1 hour ago", runs: 12, successRate: 100 },
  { id: 6, name: "Sensor Calibration Check", status: "Active", lastRun: "30 min ago", runs: 256, successRate: 98.8 },
]

export const automationLogs = [
  { id: 1, workflow: "Bin Full Alert", timestamp: "2026-02-27 14:32:01", status: "Success", message: "Alert sent for BIN-009" },
  { id: 2, workflow: "AQI Threshold Notification", timestamp: "2026-02-27 14:15:22", status: "Success", message: "Notification sent to district managers" },
  { id: 3, workflow: "Emergency Response Trigger", timestamp: "2026-02-27 13:45:10", status: "Success", message: "Emergency protocol activated for Industrial Zone" },
  { id: 4, workflow: "Route Optimizer", timestamp: "2026-02-25 09:00:00", status: "Failed", message: "Timeout - GPS data unavailable" },
  { id: 5, workflow: "Daily Report Generator", timestamp: "2026-02-27 08:00:00", status: "Success", message: "Daily report generated and distributed" },
  { id: 6, workflow: "Sensor Calibration Check", timestamp: "2026-02-27 14:00:00", status: "Success", message: "All sensors within tolerance" },
]

export const alerts = [
  { id: 1, type: "Critical", message: "BIN-009 at Waterfront Promenade has reached 95% capacity", time: "1 min ago", read: false },
  { id: 2, type: "Critical", message: "BIN-001 at Main St & 5th Ave has reached 92% capacity", time: "2 min ago", read: false },
  { id: 3, type: "Warning", message: "AQI in Industrial Zone has reached 142 (Unhealthy for Sensitive Groups)", time: "8 min ago", read: false },
  { id: 4, type: "Critical", message: "BIN-005 at University Campus has reached 88% capacity", time: "12 min ago", read: true },
  { id: 5, type: "Info", message: "Daily waste collection route optimization completed", time: "1 hour ago", read: true },
  { id: 6, type: "Warning", message: "PM2.5 levels rising in Downtown Core area", time: "2 hours ago", read: true },
  { id: 7, type: "Info", message: "Scheduled maintenance for sensor network completed", time: "3 hours ago", read: true },
  { id: 8, type: "Critical", message: "Emergency protocol activated for Industrial Zone air quality", time: "4 hours ago", read: true },
]

export const predictionChartData = [
  { hour: "Now", actual: 78, predicted: 78 },
  { hour: "+1h", actual: null, predicted: 82 },
  { hour: "+2h", actual: null, predicted: 88 },
  { hour: "+3h", actual: null, predicted: 85 },
  { hour: "+4h", actual: null, predicted: 76 },
  { hour: "+5h", actual: null, predicted: 70 },
  { hour: "+6h", actual: null, predicted: 62 },
]
