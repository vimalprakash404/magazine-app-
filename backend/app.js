const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs');

const app = express();
const PORT = 4003; 
require('dotenv').config();

app.use(cors())

function extractDomain(url) {
    try{ 
        const domain = new URL(url).hostname; 
        return domain ; 
    }
    catch(error){
        console.error("Invalid URl: " , error) ; 
        return null;
    }
}


app.get("/api/check-whitelisted/", (req, res)=>{
    // console.log("check-whitelisted" , req.query.url);
    const whiteListedDomains = process.env.WHITE_LISTED_DOMAINS.split(",");
    const domain = extractDomain(req.query.url);
    console.log("domain" , domain);
    // console.log("whiteListedDomains" , whiteListedDomains);
    if(whiteListedDomains.includes(domain)){
        return res.status(200).send("Domain is white listed" )
    }
    return res.status(400).send("Domain is not white listed");
})


app.get('/api/pdf', async(req , res )=>{
    const pdfUrl = req.query.url ;
    if (!pdfUrl){

    }
    try {
        console.log("Fetching Pdf  ", pdfUrl );
        //get dom
        console.log("Fetching domain pdf   ", extractDomain(pdfUrl) );
        const whiteListedDomains = process.env.WHITE_LISTED_DOMAINS
        if (!whiteListedDomains.includes(extractDomain(pdfUrl))){
            console.log("Domain not white listed  ", extractDomain(pdfUrl) );
            return res.status(400).send("Domain not white listed" )
        }
        console.log("whiteListedDomains  ", whiteListedDomains );
        const fetch = await import('node-fetch')
        const response = await fetch.default(pdfUrl);
        const buffer = await response.buffer();
        res.set('Content-Type', 'application/pdf');
        res.send(buffer);
    }
    catch(error){
        console.log("Error fetching Pdf  ", error );
        res.status(500).send("Error fetching PDF" )
    }
});
app.use(express.static(path.join(__dirname, 'public')));
app.get("/api/magazine/:name",(req, res)=>{
    const name  = req.params.name; 
    const  pdfPath   = path.join(__dirname , `./public/${name}.pdf`);

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



app.listen(PORT , ()=>{
    console.log(`Proxy server is running on http://localhost:${PORT}`);
})


