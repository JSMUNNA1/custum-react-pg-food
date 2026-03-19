import { MyReact } from './fiber-react';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
MyReact.render(MyReact.createElement(App, {}), container);
