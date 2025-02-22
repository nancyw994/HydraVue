// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'

// 获取页面中挂载 React 应用的根节点
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
    );
} else {
    console.error("找不到挂载节点 #root，请检查 public/index.html 文件。");
}
