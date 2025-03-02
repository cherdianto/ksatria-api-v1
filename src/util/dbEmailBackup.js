import mongoose from "mongoose";
import fs from "fs";
import nodemailer from "nodemailer";
// import crypto from "crypto";
import { sendGeneralNotification } from "./emailNotification.js";

const BACKUP_FILE = "mongodb_backup.json";
const EMAIL_TO = "webcreatia@gmail.com";
// const ENCRYPTED_FILE = "mongodb_backup.enc";
// const CRYPTO_PASSWORD = "BismillahLulus2025!";

// 🔒 Encryption Config
// const ENCRYPTION_KEY = crypto.scryptSync(CRYPTO_PASSWORD, "salt", 32); 
// const IV = crypto.randomBytes(16); // Generates a random IV

// Function to Encrypt File
// function encryptFile(inputFile, outputFile) {
//   const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
//   const input = fs.createReadStream(inputFile);
//   const output = fs.createWriteStream(outputFile);

//   output.write(IV); // Store IV in the file for decryption
//   input.pipe(cipher).pipe(output);

//   return new Promise((resolve) => output.on("finish", resolve));
// }

export const backupAndEmail = async () => {
  try {
    // 2️⃣ Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    let backupData = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📦 Backing up collection: ${collectionName}`);

      // const Model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
      const Model = mongoose.models[collectionName] ? mongoose.model(collectionName) : mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
      backupData[collectionName] = await Model.find().lean();
    }

    // 3️⃣ Write backup to JSON file
    // fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2)); // this code is blocking, use below instead
    await fs.promises.writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2));

    console.log("✅ Backup file created");

    // 4️⃣ Encrypt the file
    // await encryptFile(BACKUP_FILE, ENCRYPTED_FILE);
    // console.log("🔒 Backup file encrypted");

    // 4️⃣ Configure email sender
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

    // 5️⃣ Send email with backup file
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: EMAIL_TO,
      subject: `MongoDB Full Backup ${Date.now()}`,
      text: "Attached is the latest MongoDB backup.",
      // attachments: [{ filename: ENCRYPTED_FILE, path: `./${ENCRYPTED_FILE}` }], // encrypted
      attachments: [{ filename: BACKUP_FILE, path: `./${BACKUP_FILE}` }],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Backup emailed successfully!");

    // 6️⃣ Cleanup: Remove backup file
    if (fs.existsSync(BACKUP_FILE)) fs.unlinkSync(BACKUP_FILE);
    // fs.unlinkSync(ENCRYPTED_FILE);
    console.log("🗑️ Backup file deleted locally");

    // Disconnect from MongoDB
    // await mongoose.disconnect();
  } catch (error) {
    await sendGeneralNotification('Backup Failed, ', error)
    console.error("❌ Backup failed:", error);
  }
}
