const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs');

const app = express();
const PORT = 4003;
require('dotenv').config();

app.use(cors())

function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain;
    } catch (error) {
        console.error("Invalid URl: ", error);
        return null;
    }
}


app.get("/api/check-whitelisted/", async (req, res) => {
  try {
    const urlToCheck = req.query.url;

    // --- 1. Validate Input ---
    if (!urlToCheck) {
      return res.status(400).send("Bad Request: 'url' query parameter is missing.");
    }

    // Decode the URL parameter and handle special characters
    let decodedUrl = decodeURIComponent(urlToCheck);
    decodedUrl = decodedUrl.replace(/&amp;/g, '&');

    // --- 2. Check Whitelist First ---
    // Get whitelist from env, provide a fallback empty string, and split into an array
    const whiteListedDomains = (process.env.WHITE_LISTED_DOMAINS || "").split(",");
    
    // Clean up whitespace from .env entries
    const trimmedWhiteList = whiteListedDomains.map(d => d.trim()).filter(d => d.length > 0);

    const domain = extractDomain(decodedUrl);

    if (!domain) {
      return res.status(400).send("Bad Request: Invalid URL format.");
    }

    console.log("Checking domain:", domain);
    console.log("Whitelist:", trimmedWhiteList);

    if (!trimmedWhiteList.includes(domain)) {
      console.log("Domain is NOT white listed:", domain);
      return res.status(403).send("Forbidden: Domain is not whitelisted."); // 403 is more semantically correct here
    }

    console.log("Domain is whitelisted:", domain);

    // --- 3. If Whitelisted, Check Content-Type (using GET instead of HEAD) ---
    const fetch = await import('node-fetch');
    let response;
    
    // Some servers might not support HEAD requests properly, so let's use GET
    try {
        // Manually encode the URL while preserving certain characters
        const encodedUrl = decodedUrl
            .replace(/%20/g, ' ')  // decode spaces first
            .replace(/&/g, '%26')  // encode ampersands
            .replace(/ /g, '%20'); // re-encode spaces
            
        console.log("Attempting to fetch URL:", encodedUrl);
        response = await fetch.default(encodedUrl, {
            method: 'GET',
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
                'Accept': 'application/pdf,*/*',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            redirect: 'follow',
            follow: 5
        });

        if (!response.ok) {
            // Handle cases where the URL is valid but leads to an error (404, 500, etc.)
            console.log(`Failed to fetch, status: ${response.status}`);
            return res.status(502).send(`Bad Gateway: Upstream server returned status ${response.status}`);
        }
    } catch (fetchError) {
        console.error("Error fetching URL:", fetchError.message);
        return res.status(502).send(`Bad Gateway: ${fetchError.message}`);
    }

    const contentType = response.headers.get("content-type");
    console.log("Fetched Content-Type:", contentType);

    // Use toLowerCase() for a more robust check (e.g., 'application/PDF')
    if (!contentType || !contentType.toLowerCase().includes("application/pdf")) {
      console.log("Unsupported content type:", contentType);
      return res.status(415).send("Unsupported Media Type: Expected PDF.");
    }

    // --- 4. Success ---
    // If we reach this point, the domain is whitelisted AND the content-type is PDF.
    console.log("Success: Domain whitelisted and content is PDF.");
    return res.status(200).send("OK: Domain is whitelisted and content is a PDF.");

  } catch (error) {
    // This will catch network errors (e.g., DNS lookup failure, server unreachable)
    console.error("Error in /api/check-whitelisted:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});


app.get('/api/pdf', async (req, res) => {
    const pdfUrl = req.query.url;
    if (!pdfUrl) {
        return res.status(400).send("Bad Request: 'url' query parameter is missing.");
    }
    try {
        // Double decode to handle potentially double-encoded URLs
        let decodedPdfUrl = decodeURIComponent(pdfUrl);
        // Handle any remaining special characters
        decodedPdfUrl = decodedPdfUrl.replace(/&amp;/g, '&');
        console.log("Fetching Pdf", decodedPdfUrl);
        const domain = extractDomain(decodedPdfUrl);
        console.log("Fetching domain pdf", domain);

        const whiteListedDomains = process.env.WHITE_LISTED_DOMAINS;
        if (!whiteListedDomains.includes(domain)) {
            console.log("Domain not white listed", domain);
            return res.status(400).send("Domain not white listed");
        }

        console.log("whiteListedDomains", whiteListedDomains);

        const fetch = await import('node-fetch');
        console.log("Attempting to fetch PDF from:", decodedPdfUrl);
        
        // Manually encode the URL while preserving certain characters
        const encodedUrl = decodedPdfUrl
            .replace(/%20/g, ' ')  // decode spaces first
            .replace(/&/g, '%26')  // encode ampersands
            .replace(/ /g, '%20'); // re-encode spaces
            
        console.log("Attempting to fetch with encoded URL:", encodedUrl);
        
        const response = await fetch.default(encodedUrl, {
            timeout: 30000, // 30 second timeout for PDFs since they can be large
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
                'Accept': 'application/pdf,*/*',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            redirect: 'follow',  // follow any redirects
            follow: 5  // follow up to 5 redirects
        });

        if (!response.ok) {
            console.error(`Failed to fetch PDF, status: ${response.status}`);
            console.error('Response headers:', [...response.headers.entries()]);
            console.error('Final URL after redirects:', response.url);
            
            let errorMessage = `Failed to fetch PDF: ${response.statusText}`;
            if (response.status === 403) {
                errorMessage = "Access denied. The server refused to provide the PDF.";
            } else if (response.status === 404) {
                errorMessage = "PDF file not found on the server.";
            }
            
            return res.status(502).send(errorMessage);
        }

        // ✅ Check if response is a PDF
        const contentType = response.headers.get("content-type");
        console.log("Fetched Content-Type:", contentType);

        const validPdfTypes = ['application/pdf', 'binary/octet-stream', 'application/x-pdf', 'application/octet-stream'];
        const isValidPdfType = validPdfTypes.some(type => contentType?.toLowerCase().includes(type.toLowerCase()));
        
        if (!contentType || !isValidPdfType) {
            console.log("Unsupported content type:", contentType);
            return res.status(415).send("Unsupported Media Type: Expected PDF");
        }

        const buffer = await response.buffer();
        res.set('Content-Type', 'application/pdf');
        res.send(buffer);

    } catch (error) {
        console.error("Error fetching PDF:", {
            message: error.message,
            type: error.type,
            code: error.code,
            url: decodedPdfUrl
        });
        
        let errorMessage = "Error fetching PDF";
        if (error.code === 'ETIMEDOUT') {
            errorMessage = "Request timed out while fetching the PDF";
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = "Unable to connect to the PDF server";
        } else if (error.type === 'system') {
            errorMessage = "Network error while fetching the PDF";
        }
        
        res.status(500).send(errorMessage);
    }
});
app.use(express.static(path.join(__dirname, 'public')));
app.get("/api/magazine/:name", (req, res) => {
    const name = req.params.name;
    const pdfPath = path.join(__dirname, `./public/${name}.pdf`);

    fs.readFile(pdfPath, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not load PDF file.');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=sample.pdf');
        res.sendFile(pdfPath);
    });
})


app.use(express.static(path.resolve(__dirname, '../build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});



app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
})