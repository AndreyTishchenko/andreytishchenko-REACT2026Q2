import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from './App';
import { ThemeProvider } from './context/ThemeProvider';
import { store } from './store/store';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found. Even React needs somewhere to live.');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Provider>
);
