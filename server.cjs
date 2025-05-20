const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Allow React frontend to access backend
app.use(cors());

// Serve the dummy PDF
app.get('reports/:serial', (req, res) => {
    const serial = req.params.serial;

  if (serial === '12345') {
    const filePath = path.join(__dirname, 'public', 'dummy-report.pdf');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Report not found');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});