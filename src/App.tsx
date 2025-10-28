import { ConfigProvider } from 'antd';
import { antdTheme } from './theme/antdTheme';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;
