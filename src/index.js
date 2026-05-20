import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import VideoPairApp from './App_onebyone';
import VideoPairApp_simple from './App_onebyone_simple';

import { HashRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from "@mui/material/styles";


const theme = createTheme({
  typography: {
    fontFamily: "Inter, Montserrat, Roboto, Arial, sans-serif, Titillium Web, Helvetica",
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <HashRouter>
  <ThemeProvider theme={theme}>
    <VideoPairApp_simple/>
  </ThemeProvider >
  </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
