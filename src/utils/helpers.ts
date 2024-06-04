import * as tus from "tus-js-client";
import { sha256 } from "js-sha256";

//Get list of libraries from the Bunny
export const getLibraryList = async (setLibraryList: (val: any[]) => void) => {
  const url = `https://api.bunny.net/videolibrary`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        AccessKey: process.env.NEXT_PUBLIC_BUNNY_API_KEY ?? "",
      },
    });

    if (response.ok) {
      const data = await response.json();
      setLibraryList(data);
      console.log("Video object created successfully:", data);
    } else {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching library list:", error);
    setLibraryList([]);
  }
};

//Create a videoObject for video upload
export const createVideoObject = async (
  title: string,
  setVideoID: (val: string) => void
) => {
  const url = `https://video.bunnycdn.com/library/${process.env.NEXT_PUBLIC_LIBRARY_ID}/videos`;

  const data = {
    title,
    collectionId: process.env.NEXT_PUBLIC_COLLECTION_ID,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        AccessKey: process.env.NEXT_PUBLIC_LIBRARY_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();
      setVideoID(data.guid);
      console.log("Video object created successfully:", data);
      return data;
    } else {
      throw new Error(`Failed to create video object: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error creating video object:", error);
  }
};

//Upload video in CHUNCKS via TUS
export const handleVideoUpload = (
  videoObject: any,
  files: FileList,
  title: string,
  setUploadProgress: (val: number) => void,
  setSuccesMessage: (val: string) => void
) => {
  const expirationTime = Math.floor(Date.now() / 1000) + 24 * 3600;

  const presigned_signature = sha256(
    `${process.env.NEXT_PUBLIC_LIBRARY_ID}${process.env.NEXT_PUBLIC_LIBRARY_API_KEY}${expirationTime}${videoObject.guid}`
  );

  const upload = new tus.Upload(files[0], {
    endpoint: `https://video.bunnycdn.com/tusupload`,
    retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
    headers: {
      AuthorizationSignature: presigned_signature,
      AuthorizationExpire: expirationTime.toString(),
      VideoId: videoObject.guid,
      LibraryId: process.env.NEXT_PUBLIC_LIBRARY_ID ?? "",
    },
    // chunkSize,
    metadata: {
      filetype: files[0].type,
      title: title,
      collection: process.env.NEXT_PUBLIC_COLLECTION_ID ?? "",
    },

    onError: async (error) => {
      console.error("Failed to upload video:", error);
      await deleteVideoObject(videoObject.guid);
    },

    onProgress: (bytesUploaded, bytesTotal) => {
      const percentComplete = (bytesUploaded / bytesTotal) * 100;
      setUploadProgress(percentComplete);
      console.log(`Upload progress: ${percentComplete}%`);
    },

    onSuccess: () => {
      console.log("Upload finished:", upload.url);
      setSuccesMessage(`Upload finished: ${upload.url}`);
    },
  });

  //continue upload
  upload.findPreviousUploads().then(function (previousUploads) {
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  });
};

//Delete videoObject - used if video upload fail
export const deleteVideoObject = async (videoID: string) => {
  const url = `https://video.bunnycdn.com/library/${process.env.NEXT_PUBLIC_LIBRARY_ID}/videos/${videoID}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        AccessKey: process.env.NEXT_PUBLIC_LIBRARY_API_KEY ?? "",
      },
    });

    if (response.ok) {
      console.log("Video object deleted successfully");
    } else {
      console.error("Failed to delete video object", response.statusText);
    }
  } catch (error) {
    console.error("Error deleting video object", error);
  }
};
