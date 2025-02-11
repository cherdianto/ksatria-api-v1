import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import mongoose from "mongoose";

const ENCRYPTED_FILE = "mongodb_backup.enc";
const DECRYPTED_FILE = "mongodb_backup.json";
const ENCRYPTION_KEY = crypto.scryptSync("your-secret-password", "salt", 32);

function decryptFile(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    let iv = Buffer.alloc(16);
    const fd = fs.openSync(inputFile, "r");
    fs.readSync(fd, iv, 0, 16, 0); // Read IV from file
    fs.closeSync(fd);

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    const inputStream = fs.createReadStream(inputFile, { start: 16 });
    const outputStream = fs.createWriteStream(outputFile);

    inputStream.pipe(decipher).pipe(outputStream).on("finish", resolve).on("error", reject);
  });
}

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });

const restore = [
  upload.single("backup"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded!" });

      // Move uploaded file to expected path
      fs.renameSync(req.file.path, ENCRYPTED_FILE);

      // 🔓 Step 1: Decrypt the uploaded backup file
      await decryptFile(ENCRYPTED_FILE, DECRYPTED_FILE);
      console.log("🔓 Backup file decrypted successfully");

      // Step 2: Read decrypted JSON file
      const backupData = JSON.parse(fs.readFileSync(DECRYPTED_FILE, "utf-8"));

      // Step 3: Restore each collection
      for (const collectionName in backupData) {
        const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
        await Model.deleteMany({});
        await Model.insertMany(backupData[collectionName]);
        console.log(`✅ Restored collection: ${collectionName}`);
      }

      // Cleanup
      fs.unlinkSync(ENCRYPTED_FILE);
      fs.unlinkSync(DECRYPTED_FILE);

      res.json({ success: true, message: "Database restored successfully!" });
    } catch (error) {
      console.error("❌ Restore failed:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
];

export default {
  restore
};