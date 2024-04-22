const express = require('express');
const app = express();
const otpRoutes = require('./src/routes/OtpRoutes');

const PORT = 8081;

app.use('/api/otp', otpRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});