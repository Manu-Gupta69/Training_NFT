const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const fs = require('fs');
const multer = require('multer');
const pinataSDK = require('@pinata/sdk');
const path = require('path');
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
const { mintNFT } = require('./mint-nft');
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single('nftImage'), async (req, res, next) => {
  try {
    const imgPath = path.join(__dirname, '..', 'uploads');
    const readableStreamForFile = fs.createReadStream(
      `${imgPath}//${req.file.originalname}`
    );

    const optionsForFile = {
      pinataMetadata: {
        name: req.file.originalname,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const { IpfsHash, TimeStamp } = await pinata.pinFileToIPFS(
      readableStreamForFile,
      optionsForFile
    );

    const { fileName, fileDetails } = req.body;

    if (!fileName || !fileDetails) {
      res.send({ err: 'invalid data', data: null });
      return;
    }

    const data = {
      attributes: [
        {
          value: req.body.fileName,
        },
      ],
      description: req.body.fileDetails,
      image: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
      name: req.body.fileName,
    };

    const body = data;
    const options = {
      pinataOptions: {
        cidVersion: 0,
      },
    };
    const result = await pinata.pinJSONToIPFS(body, options);

    await mintNFT(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

    res.send({ result });
  } catch (err) {
    console.log(err);
    res.send({ err, data: null });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('server running on PORT', port);
});
