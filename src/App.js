// App.js
import Test from './components/PDFFlipbook';
import React, { useEffect } from 'react';
import MobileView  from "./components/MobileView";
import {  Routes, Route, BrowserRouter } from 'react-router-dom';
import { isMobile as isMob, isTablet } from 'react-device-detect';
import axios from 'axios';

// Define a component to display the PDF
const PdfViewer = () => {
  // Access the URL parameter using useParams hook
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdfUrl');
  const mainUrl=  "/api/pdf?url="; 
  const [isWhiteListed , setIsWhiteListed] = React.useState(true)

  async function getWhiteListed(){
    try{
      const response =await axios.get("/api/check-whitelisted?url="+pdfUrl) ;
      console.log(response.data)
      setIsWhiteListed(true)
    }
    catch (error){
      console.log(error.response)
      if(error.response.status === 400) setIsWhiteListed(false)    
      }
  }
  useEffect(() => {
   getWhiteListed()
  } , [])
  if (isWhiteListed === false){
    document.body.style.backgroundColor = "white";
    const containerStyle = {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f4f8',
      fontFamily: 'Arial, sans-serif',
    };
  
    const messageStyle = {
      padding: '20px 40px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      color: '#333',
    };
  
    const headingStyle = {
      margin: '0',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#e63946',
    };
  
    return (
      <div style={containerStyle}>
        <div style={messageStyle}>
          <h1 style={headingStyle}>This Domain is Not White Listed</h1>
        </div>
      </div>
    );
  }
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
