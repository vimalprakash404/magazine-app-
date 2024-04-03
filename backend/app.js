const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs');

const app = express();
const PORT = 4003; 

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/pdf', async(req , res )=>{
    const pdfUrl = req.query.url ;
    if (!pdfUrl){

    }
    try {
        const fetch = await import('node-fetch')
        const response = await fetch.default(pdfUrl);
        const buffer = await response.buffer()
        res.set('Content-Type', 'application/pdf');
        res.send(buffer);
    }
    catch(error){
        console.log("Error fetching Pdf  ", error );
        res.status(500).send("Error fetching PDF" )
    }
});

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


