import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Application from './application';
import { ThemeProvider } from '@emotion/react';
import { muiTheme } from './theme';
import { CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Application />
        </ThemeProvider>
    </React.StrictMode>
);

