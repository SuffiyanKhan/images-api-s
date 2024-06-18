// import express from 'express';
// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import path from 'path';
// import fs from 'fs'; 

// const app = express();
// const PORT = process.env.PORT || 8000;

// cloudinary.config({
//     cloud_name: 'dandp2osc', 
//     api_key: 734246468235897,       
//     api_secret: 'xC6A21_VzEcGj0LtMvT3D5WfuyA'  
// });

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, uniqueSuffix + ext); 
//     }
// });

// const upload = multer({ storage: storage });
// // Route to handle single image upload
// app.post('/upload', upload.single('image'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             upload_preset: 'my_preset' 
//         });
//         fs.unlinkSync(req.file.path);
//        return res.status(200).json({ imageUrl: result.secure_url,publicId: result.public_id });
//     } catch (error) {
//         return  res.status(500).json({ message: 'Error uploading image', error: error.message });
//     }
// });

// // Route to handle multiple image uploads

// app.post('/uploads', upload.array('images', 10), async (req, res) => {
//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({ message: 'No files uploaded' });
//         }
//         const uploadPromises = req.files.map(file => {
//             return cloudinary.uploader.upload(file.path, {
//                 upload_preset: 'my_preset' 
//             });
//         });
//         // zxdhyfghvfmyc8stgx3h
//         // Execute all upload promises concurrently
//         const results = await Promise.all(uploadPromises);

//         // Array to hold Cloudinary image URLs and public_ids
//         const imagesData = results.map(result => {
//             return {
//                 imageUrl: result.secure_url,
//                 publicId: result.public_id
//             };
//         });

//         // Once uploaded to Cloudinary, delete the files from local storage
//         req.files.forEach(file => {
//             fs.unlinkSync(file.path);
//         });

//         // Respond with array of Cloudinary image URLs and public_ids
//         return  res.status(200).json({ imagesData });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error uploading images', error: error.message });
//     }
// });
// // Route to handle single image delete
// app.delete('/delete-image/:public_id', async (req, res) => {
//     try {
//         const { public_id } = req.params;
//         // Delete image using Cloudinary's destroy method
//         const deleteResponse = await cloudinary.uploader.destroy(public_id);
//         // Respond with success message
//         return  res.status(200).json({ message: 'Image deleted successfully', deleteResponse });
//     } catch (error) {
//         return  res.status(500).json({ message: 'Error deleting image', error: error.message });
//     }
// });
// // Route to handle all images delete
// app.delete('/delete-all-images', async (req, res) => {
//     try {
//         // Fetch all resources (images) from Cloudinary
//         const { resources } = await cloudinary.api.resources({
//             type: 'upload',
//             prefix: '', // You can specify a prefix to narrow down the search (optional)
//             max_results: 100 // Adjust max_results as per your needs
//         });

//         // Extract public_ids of all images
//         const publicIds = resources.map(resource => resource.public_id);

//         // Delete all images using Cloudinary's Batch API
//         const deleteResponse = await cloudinary.api.delete_resources(publicIds);

//         // Respond with success message
//         return   res.status(200).json({ message: 'All images deleted successfully', deleteResponse });
//     } catch (error) {
//         return  res.status(500).json({ message: 'Error deleting images', error: error.message });
//     }
// });

// app.get('/',(req,res)=>{
//     return res.status(200).json("hi")
// })

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const app = express();
const PORT = process.env.PORT || 8000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Set these variables in Vercel environment
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert the buffer to a readable stream and upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream({
        upload_preset: 'my_preset' // Replace with your Cloudinary upload preset name
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      streamifier.createReadStream(req.file.buffer).pipe(upload_stream);
    });

    res.status(200).json({ 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
