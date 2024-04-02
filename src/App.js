// App.js
import Test from './components/PDFFlipbook';
import React from 'react';
import MobileView  from "./components/MobileView";
import {  Routes, Route, BrowserRouter } from 'react-router-dom';
import { isMobile as isMob, isTablet } from 'react-device-detect';

// Define a component to display the PDF
const PdfViewer = () => {
  // Access the URL parameter using useParams hook
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdfUrl');
  const mainUrl=  "/api/pdf?url="; 
  if (isMob) {
    return <MobileView url={mainUrl+pdfUrl}/>
  }
  else if (isTablet){
    return <MobileView url={mainUrl+pdfUrl}/>
  }
  else {
    return <Test url={mainUrl+pdfUrl}/>
  }
};

// Define your main App component
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="pdf/" element={<PdfViewer/>}/>
      </Routes>
   
    </BrowserRouter>
  );
};

export default App;
