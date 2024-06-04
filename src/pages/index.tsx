import React, { useState } from "react";

import {
  createVideoObject,
  deleteVideoObject,
  getLibraryList,
  handleVideoUpload,
} from "@/utils/helpers";

export default function Home() {
  const [title, setTitle] = useState("");
  const [file, setFiles] = useState<FileList | null>(null);
  const [videoID, setVideoID] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [succesMessage, setSuccesMessage] = useState("");
  const [libraryList, setLibraryList] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !file) {
      console.error("Please provide a title and a video file");
      return;
    }

    try {
      const videoObject = await createVideoObject(title, setVideoID);

      if (videoObject) {
        handleVideoUpload(
          videoObject,
          file,
          title,
          setUploadProgress,
          setSuccesMessage
        );
      }
    } catch (err) {
      console.error("Error uploading video:", err);
    }
  };

  return (
    <main
      className={`flex  flex-col items-center justify-between p-24  text-white`}
    >
      <h1 className="text-8xl mb-10">Upload video to bunny</h1>
      <form
        className="flex flex-col gap-12  justify-center"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="border-[1px] p-4 bg-gray-50 w-full text-xs text-black rounded-xl valid:focus:border-green-300 invalid:focus:border-red-300 empty:border-gray-300 placeholder:text-gray-400 "
          placeholder="Add title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full bg-orange-400 text-xs p-2 rounded-xl"
          type="file"
          onChange={handleFileChange}
        />
        <input
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          type="submit"
          value="Submit"
        />
      </form>
      <div className="w-full flex gap-4 justify-center mt-28">
        <button
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          onClick={() => getLibraryList(setLibraryList)}
        >
          Get list
        </button>
        <button
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          onClick={() => deleteVideoObject(videoID)}
        >
          Delete Video
        </button>
      </div>
      <div className="w-full px-28 py-28 flex items-start justify-between gap-10">
        <p className="text-xl">
          {uploadProgress < 100 ? (
            `Upload progress: ${Math.floor(uploadProgress)}%`
          ) : (
            <span className="text-xs text-green-400">{succesMessage}</span>
          )}
        </p>
        {libraryList.length > 0 ? (
          <ul className="text-xl">
            {libraryList.map((item, index) => {
              return (
                <li className="flex flex-col gap-2 mb-4 text-xs" key={index}>
                  <p>Library name: {item.Name}</p>
                  <p>Library ApiKey: {item.ApiKey}</p>{" "}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
