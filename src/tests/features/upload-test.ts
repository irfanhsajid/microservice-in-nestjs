/* eslint-disable @typescript-eslint/no-require-imports */
import axios from 'axios';
import * as fs from 'fs';

const path = require('path');

const FormData = require('form-data');
// const URL = 'http://localhost:3000/api/v1/vehicle/attachments/1';

const URL = 'http://localhost:3000/rust?url=testingkasdkaskdjksajd';
// const FILE_PATH = 'test.png';
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiY2FydnVAZ21haWwuY29tIiwiaWF0IjoxNzUxNDQxNjEzLCJleHAiOjE3NTIwNDY0MTN9.AyN0IuILX2-eyofr5IxISVuc07l7-hZa0RiWxTwHM6E';

async function uploadFile(id: number) {
  const form = new FormData();
  // form.append('files', fs.createReadStream(FILE_PATH), {
  //   filename: path.basename(FILE_PATH),
  //   // contentType: 'image/png',
  //   contentType: 'application/json',
  // });

  try {
    console.log(`request send id: ${id}`);
    // const response = await axios.post(URL, form, {
    //   headers: {
    //     ...form.getHeaders(),
    //     Authorization: `Bearer ${TOKEN}`,
    //     Accept: '*/*',
    //   },
    //   maxBodyLength: Infinity,
    //   maxContentLength: Infinity,
    // });
    const response = await axios.get(URL);
    // console.log(`[${id}] Upload succeeded with status: ${response.status}`);
    console.log('request success', URL);
  } catch (error: any) {
    console.error(
      `[${id}] Upload failed:`,
      error.response?.status,
      error.message,
    );
  }
}

async function runConcurrentUploads(concurrency: number) {
  const uploads: Promise<void>[] = [];
  for (let i = 0; i < concurrency; i++) {
    uploads.push(uploadFile(i));
  }
  await Promise.all(uploads);
  console.log(`Finished ${concurrency} concurrent uploads.`);
}

// Run 20 concurrent uploads as example
runConcurrentUploads(20000).catch((e) => console.log(e));
