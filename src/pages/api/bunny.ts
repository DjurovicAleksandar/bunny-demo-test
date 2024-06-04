import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; // Import fs for accessing files (server-side only)

const BUNNY_API_KEY =
  "c6ba84a1-d839-4623-93a9-704d18670fd2664cad2a-1b2e-4de1-ae03-22449b9a0463";
const LIBRARY_API_KEY = "297a42c5-0e57-4c06-b2e6a5f008c1-8374-4b8d";
const LIBRARY_ID = "249247";
const COLLECTION_ID = "b727cf64-d43a-4de4-80c6-2b77bd781ed9";

export const config = {
  api: {
    bodyParser: false, // Disable default Next.js body parsing
  },
};

const createVideoObject = async (title: string) => {
  const url = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;

  const data = {
    title,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const responseData = await response.json();
    return responseData; // Return the video object data
  } else {
    console.error("Failed to create video object", response.statusText);
    throw new Error("Failed to create video object"); // Re-throw for error handling on the client-side
  }
};

const uploadVideoToCollection = async (videoID: string, videoFile: File) => {
  const url = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoID}`;

  if (!videoFile) {
    throw new Error("No video file selected"); // Handle missing file
  }

  // Access file path from Next.js request object (SSR)

  const readStream = fs.createReadStream(filePath); // Create read stream on server

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/octet-stream", // Raw binary data
    },
    body: readStream,
  });

  if (response.ok) {
    const responseData = await response.json();
    return responseData; // Return the upload response data
  } else {
    console.error("Failed to upload video", response.statusText);
    throw new Error("Failed to upload video"); // Re-throw for error handling
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { title } = req.body;

    try {
      const videoObject = await createVideoObject(title);
      const uploadResponse = await uploadVideoToCollection(
        videoObject.guid,
        req.files?.video[0]
      ); // Access file from request object
      res.status(200).json(uploadResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message }); // Send error message to client
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
