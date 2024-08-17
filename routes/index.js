const express = require('express')
const router = express.Router()
const { signUp, protected, verifyEmail, sendEmail, transaction, mintNFT, metaData, allTemplates, FetchNftByWallet } = require('../controllers')
const authenticateToken = require('../Middleware');

router.post('/sign-up', signUp)
router.post('/send-email', sendEmail)
router.post('/verify-email', verifyEmail)
router.post('/transaction-status', transaction)
router.post('/mint-nft', mintNFT)
router.post('/meta-data', metaData)
router.post('/all-templates', allTemplates)
router.post('/fetch-nft', FetchNftByWallet)
// router.get('/protected', authenticateToken, protected)

module.exports = router;