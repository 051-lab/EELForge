import './styles.css';
import { App } from './App';
import { createRoot } from 'react-dom/client';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('EELForge requires an #app element.');

createRoot(app).render(<App />);
