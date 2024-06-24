import React, { useState } from "react";

import {
  uploadFileToBunny,
  getFileLIstFromStorage,
  downloadFileFromBunny,
  deleteFileFromBunny,
} from "@/utils/helpers";

export default function Files() {
  const [file, setFiles] = useState<FileList | null>(null);
  const [fileList, setFileList] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      console.error("Please provide a title and a video file");
      return;
    }

    try {
      setIsLoading(true);
      const data = await uploadFileToBunny(file[0]);
      console.log(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error uploading video:", err);
    }
  };

  console.log(fileList);

  return (
    <main
      className={`flex  flex-col items-center justify-between p-24  text-white`}
    >
      <h1 className="text-8xl mb-10 text-center">Upload FILE to bunny</h1>
      <form
        className="flex flex-col gap-12  justify-center"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full bg-orange-400 text-xs p-2 rounded-xl"
          type="file"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <p>Uploading file, please wait...</p>
        ) : (
          <input
            className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
            type="submit"
            value="Submit"
            disabled={isLoading}
          />
        )}
      </form>
      <div className="w-full flex gap-4 justify-center mt-28">
        <button
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          onClick={() => getFileLIstFromStorage(setFileList)}
        >
          Get file list
        </button>
        {fileList.length > 0 ? (
          <ul className="">
            {fileList.map((file: any, index) => {
              return <li key={index + file.ObjectName}>{file.ObjectName}</li>;
            })}
          </ul>
        ) : null}
        <button
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          onClick={() => deleteFileFromBunny(fileName)}
        >
          Delete File
        </button>
      </div>

      <div className="w-full flex gap-4 justify-center mt-28">
        <input
          type="text"
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="Enter file name"
          className="border-[1px] p-4 bg-gray-50 w-full text-xs text-black rounded-xl valid:focus:border-green-300 invalid:focus:border-red-300 empty:border-gray-300 placeholder:text-gray-400 "
        />
        <button
          className="relative duration-1000 flex items-center justify-center px-4 py-2 rounded-xl overflow-hidden cursor-pointer bg-orange-400 hover:text-black hover:bg-blue-300"
          onClick={() => downloadFileFromBunny(fileName)}
        >
          Download file
        </button>
      </div>
    </main>
  );
}
