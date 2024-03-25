// App.js
import Test from './components/PDFFlipbook';
import React from 'react';
import {  Routes, Route, BrowserRouter } from 'react-router-dom';

// Define a component to display the PDF
const PdfViewer = () => {
  // Access the URL parameter using useParams hook
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdfUrl');
  const mainUrl=  "http://localhost:3001/api/pdf?url="; 
  return (
   <Test url={mainUrl+pdfUrl}/>
  );
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
