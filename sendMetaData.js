const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const PINATA_API_KEY = 'e933fc59f964ee470ef6';
const PINATA_SECRET_API_KEY = 'e6534d91b994a7160ad4b8a7d3089438c092ba86d02bdd8eaa79884380ca9574';
const METADATA_FILE_PATH = './metadata.json'; // Path to your metadata file

const uploadMetadata = async () => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(METADATA_FILE_PATH));

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
            maxRedirects: 0,
            headers: {
                ...form.getHeaders(),
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });

        console.log('Metadata uploaded to Pinata!');
        console.log('IPFS Hash:', response.data.IpfsHash);
        console.log('Pinata URL:', `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
    } catch (error) {
        console.error('Error uploading metadata:', error.response ? error.response.data : error.message);
    }
};

// uploadMetadata();
const postNFTData = async (templateId, collectionId) => {
    const apiKey = process.env.API_KEY // Replace with your actual API key
    // const collectionId = 'd383cf76-23f5-4c1e-a97e-b9f6e9e0b112'; // Replace with your actual collectionId
    // const templateId = 'abacd1e6-8e14-4c9c-9297-cd5e10fb79f9';
    const url = `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/nfts`;

    const payload = {
        metadata: {
            name: "harkirat milking",
            image: "https://crossmint.myfilebase.com/ipfs/QmZRGrtbWC7CqKvXcDRCiCeoXsf1iLEpxswy3CK4yKcxyW",
            description: "Harkirat milking his 4CR package",
            attributes: []
        },
        recipient: "solana:A6Mr3Ej6Cf75uRjhzWFSz8eAU3BMwF2PbhB7jQUuvBBt",
        reuploadLinkedFiles: true,
        compressed: true
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error making the request:', error.message);
    }
};

// Call the function where you need to use it
postNFTData();
