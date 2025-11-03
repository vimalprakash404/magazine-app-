import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { isMobile as isMob, isTablet } from 'react-device-detect';
import axios from 'axios';
import Test from './components/PDFFlipbook';
import MobileView from './components/MobileView';

const PdfViewer = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pdfUrl = urlParams.get('pdfUrl');
  const mainUrl = "/api/pdf?url=";
  const encodedPdfUrl = pdfUrl ? encodeURIComponent(pdfUrl) : null;

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorHeader, setErrorHeader] = useState("Access Denied");

  useEffect(() => {
    async function checkWhitelist() {
      if (!encodedPdfUrl) {
        setStatus("error");
        setErrorHeader("Invalid URL");
        setErrorMessage("No URL provided.");
        return;
      }
      try {
        const response = await axios.get(`/api/check-whitelisted?url=${encodedPdfUrl}`);
        if (response.status === 200) setStatus("ok");
      } catch (error) {
        const statusCode = error.response?.status;
        console.log("Whitelist check error:", statusCode, error.response?.data);
        
        if (statusCode === 403) {
          setStatus("not_whitelisted");
          setErrorMessage("This domain is not allowed to display PDFs here.");
        } else if (statusCode === 415) {
          setStatus("error");
          setErrorHeader("Unsupported File Type");
          setErrorMessage("Unsupported file type. Expected a PDF file.");
        } else if (statusCode === 502) {
          setStatus("error");
          setErrorMessage("The upstream server is not responding.");
        } else if (statusCode === 400) {
          setStatus("error");
          setErrorMessage("Invalid or missing URL parameter.");
        } else {
          setStatus("error");
          setErrorMessage("An unexpected error occurred.");
        }
      }
    }
    checkWhitelist();
  }, [encodedPdfUrl]);

  if (status === "loading") {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.messageBox}>
          <h1 style={styles.heading}>Loading File...</h1>
          <p style={styles.subText}>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (status === "not_whitelisted" || status === "error") {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.messageBox}>
          <h1 style={{ ...styles.heading, color: "#e63946" }}>{errorHeader}</h1>
          <p style={styles.subText}>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isMob || isTablet) return <MobileView url={mainUrl + encodedPdfUrl} />;
  return <Test url={mainUrl + encodedPdfUrl} />;
};

const styles = {
  centerContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
  },
  messageBox: {
    backgroundColor: "#ffffff",
    padding: "40px 60px",
    borderRadius: "16px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "500px",
  },
  heading: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#2563eb",
  },
  subText: {
    marginTop: "12px",
    fontSize: "1rem",
    color: "#555",
  },
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="pdf/" element={<PdfViewer />} />
    </Routes>
  </BrowserRouter>
);

export default App;