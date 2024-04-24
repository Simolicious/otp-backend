const express = require('express');
const app = express();
const mongoose = require('mongoose');
const otpRoutes = require('./src/routes/OtpRoutes');
const cors = require('cors');

const PORT = 8081;

app.use(cors());
app.use(express.json());

const MONGODB_URI = `mongodb://my_test:my_test@127.0.0.1:27017/my_test?authSource=admin`;
mongoose.set('strictQuery', false);
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to DB'))
.catch((err) => console.log('Failed to connect to DB', err));

app.use('/api/otp', otpRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});