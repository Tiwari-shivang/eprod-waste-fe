import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { antdTheme } from './theme/antdTheme';
import { Dashboard } from './pages/Dashboard';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InProgressPage } from './pages/InProgressPage';
import { UpcomingPage } from './pages/UpcomingPage';
import { AlertsPage } from './pages/AlertsPage';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter basename="/eprod-waste-fe">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/in-progress" element={<InProgressPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/historical-data" element={<HistoricalDataPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
