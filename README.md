# AI-Driven Corrugator Waste Reduction Platform

A modern, responsive React dashboard for monitoring and reducing waste in corrugator manufacturing operations using AI-driven insights.

## Features

- **Real-time Job Monitoring**: Track current jobs with live waste risk assessment
- **AI-Powered Predictions**: Machine learning models predict waste with high accuracy
- **Interactive Dashboards**: Comprehensive KPI summaries with trend visualizations
- **Waste Alerts System**: Proactive alerts for high-risk waste events
- **Job Management**: View historical, in-progress, and upcoming jobs
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Professional UI**: Built with Ant Design for a clean, modern interface

## Technology Stack

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Ant Design 5** - Enterprise-grade UI components
- **Recharts** - Composable charting library
- **Day.js** - Lightweight date manipulation

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── CurrentJob/      # Current job card with waste risk meter
│   ├── KPISummary/      # KPI metrics and charts
│   ├── JobTables/       # Historical, In-Progress, Upcoming job tables
│   ├── JobDetails/      # Job details drawer
│   ├── WastePrediction/ # Waste alerts component
│   └── shared/          # Shared components (MetricCard, WasteRiskMeter)
├── pages/               # Page-level components
│   └── Dashboard.tsx    # Main dashboard page
├── services/            # API and data services
│   └── dataService.ts   # CSV data parser and mock API
├── types/               # TypeScript type definitions
│   └── index.ts         # Application interfaces
├── theme/               # Ant Design theme configuration
│   └── antdTheme.ts     # Custom theme tokens
├── data/                # Mock data files
│   └── corrugator_logs_synthetic_enriched.csv
├── App.tsx              # Root application component
└── main.tsx             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd corrugator-waste-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Key Components

### Current Job Card
Displays the currently running job with:
- Job details (name, operator, paper grade, flute)
- Completion progress
- Waste risk meter (visual gauge)
- Predicted waste metrics
- AI confidence score

### KPI Summary
Shows key performance indicators:
- Total waste saved
- Active alerts count
- Offline events
- AI prediction accuracy
- Trend chart (actual vs predicted waste)

### Job Tables

**Historical Jobs**
- Completed jobs with waste metrics
- Confidence scores
- Saved waste amounts

**In-Progress Jobs**
- Currently running jobs
- Completion percentages
- Real-time waste risk

**Upcoming Jobs**
- Scheduled jobs
- Expected changeover times
- Predicted waste ranges

### Waste Alerts
- Real-time alerts for high-risk events
- Severity-based color coding (high, medium, low)
- AI confidence ratings
- Actionable recommendations

## Design Principles

Following React Best Practices 2025:

- ✅ **Functional Components** - All components use React hooks
- ✅ **TypeScript** - Fully typed for better DX and safety
- ✅ **Modular Structure** - Clear separation of concerns
- ✅ **Responsive Design** - Mobile-first approach with Ant Design Grid
- ✅ **Performance** - Optimized with React.memo and useMemo where needed
- ✅ **Accessibility** - WCAG AA compliant color contrast
- ✅ **Clean Code** - Components under 300 lines, well-documented

## Data Source

The application uses synthetic corrugator log data that includes:
- Job information (ID, paper grade, flute type)
- Process parameters (speed, steam, glue gap)
- Waste predictions (setup waste, dry-end waste)
- AI insights (confidence scores, recommendations)
- Operator actions and responses

## Responsive Breakpoints

The dashboard uses Ant Design's responsive grid system:
- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Small tablets)
- **md**: ≥ 768px (Tablets)
- **lg**: ≥ 992px (Small desktops)
- **xl**: ≥ 1200px (Desktops)
- **xxl**: ≥ 1600px (Large screens)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time WebSocket integration for live data updates
- Advanced filtering and search capabilities
- Export functionality (PDF, Excel reports)
- User authentication and role-based access
- Dark mode toggle
- Multi-language support
- Performance analytics and benchmarking

---

**Built with best practices following the React Application Best Practices 2025 Edition**
