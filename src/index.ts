import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import upload from "./multer-config";
import streamifier from "streamifier";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post(
  "/upload",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "uploads_file",
        },
        (error, result) => {
          if (error || !result) {
            throw new Error("Failed to upload to Cloudinary");
          }
          res.json({ imageUrl: result.secure_url });
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error uploading image to Cloudinary" });
    }
  }
);

// Local Storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage });

// app.post(
//   "/api/upload",
//   upload.single("file"),
//   (req, res) => {
//     res.json("File uploaded successfully");
//   }
// );

app.get("/", (req, res) => {
  res.json("Api is working awesome");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
