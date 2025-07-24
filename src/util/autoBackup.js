import { google } from "googleapis";
import dotenv from 'dotenv'
import {spawn} from 'child_process'

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: '../credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
})

const drive = google.drive({ version: 'v3', auth})

export const backupAndUploadDb = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
  const fileName = `backup-${timestamp}.gz`;

  console.log('starting database backup');

  const mongodump = spawn('mongodump', ['--archive', '--gzip']);

  const uploadStream = await drive.files.create({
    requestBody: { name: fileName},
    media: {mimeType: 'application/gzip', body: mongodump.stdout},
    fields: 'id'
  },
{responseType: 'stream'})

return new Promise((resolve, reject) => {
  uploadStream.data.on('end', () => {
    console.log(`Backup uploaded to Google Drive with ID: ${uploadStream.data.id}`);
    resolve(uploadStream.data.id);
  });

  uploadStream.data.on('error', (error) => {
    console.error('Error uploading backup to Google Drive:', error);
    reject(error);
  });

  mongodump.on('error', (error) => {
    console.error('Error during database backup:', error);
    reject(error);
  });

  mongodump.on('close', (code) => {
    if (code !== 0) {
      console.error(`mongodump process exited with code ${code}`);
      reject(new Error(`mongodump failed with exit code ${code}`));
    }
  });
});


}
