const express = require('express')
const app = express();
const cors = require('cors');
const router = require('./routes')
const dotenv = require('dotenv');
dotenv.config();
require('./mongo')

app.use(cors())
app.use(express.json());
app.use('/wesol/v1', router)


app.listen(process.env.PORT, () => {
    console.log(`App has started on port ${process.env.PORT}`);
})