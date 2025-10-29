import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { antdTheme } from './theme/antdTheme';
import { Dashboard } from './pages/Dashboard';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InProgressPage } from './pages/InProgressPage';
import { UpcomingPage } from './pages/UpcomingPage';
import { AlertsPage } from './pages/AlertsPage';

const wasteAlerts = [
  'High waste detected on Line 2 - Job #JOB-2847. AI suggests reducing speed to 165 m/min.',
  'Material grade change detected. Adjust steam temperature to 182°C for optimal results.',
  'Tension irregularity detected on wet end. Immediate operator attention required.',
  'Predicted waste exceeds threshold for Job #JOB-3921. Review AI recommendations.',
  'Moisture level variance detected. Consider adjusting glue gap to 85μm.',
];

function App() {
  useEffect(() => {
    // Show toast notification every 2 minutes
    const showAlertNotification = () => {
      const randomAlert = wasteAlerts[Math.floor(Math.random() * wasteAlerts.length)];
      toast.warning(randomAlert, {
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    // Show first notification after 10 seconds
    const initialTimeout = setTimeout(() => {
      showAlertNotification();
    }, 10000);

    // Then show notification every 2 minutes (120000ms)
    const interval = setInterval(() => {
      showAlertNotification();
    }, 120000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter basename="/eprod-waste-fe">
        <ToastContainer
          position="top-right"
          autoClose={8000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
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
