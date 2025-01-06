import React, { useState } from "react";
import Cropper from "./components/Cropper";
import BoxImage from "../../assets/boxImage.png";
import "./Upload.scss";

// Defining the props interface
import { UploadProps } from "./Upload.types";
import { axiosPost, responseNormalizer } from "./Axios";

/**
 * This is a functional component that can be used to upload files of almost any type, supporting image file editing.
 *
 * @param type - Choose between "image" or "file"; this will render two different buttons.
 * @param iconSrc - The SRC of the icon that will be used in the button.
 * @param callback - This function should receive a File (file) and handle the upload of the file.
 * @returns {JSX.Element} Returns a React component.
 */
const Upload = ({ type, iconSrc, callback, config }: UploadProps) => {
  // Refs
  const hiddenFileInput: any = React.useRef(null);
  const spanRef: any = React.useRef(null);

  // Global State
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [openImageCropper, setOpenImageCropper] = useState(false);

  const uploadImage = (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("[Upload] No file selected!");
      return;
    }

    setFile(file);

    if (type === "image") {
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        setSrc(reader.result as string);
        setOpenImageCropper(true);
      });

      reader.readAsDataURL(file);
      return;
    }

    spanRef.current.innerHTML =
      file.name.length > 10
        ? `${file.name.slice(0, 10)}(...) .${file.name.split(".").pop()}`
        : file.name;

    axiosPost(file, "/api/fileupload")
      .then((response) => {
        console.log("[Upload] File uploaded successfully!", response);
        callback(responseNormalizer(response, null, file));
      })
      .catch((error) => {
        callback(responseNormalizer(null, error, file));

        console.error("[Upload] Error uploading file to the server!", error);
        setFile(null);
        spanRef.current.innerHTML = "Try again!";
        spanRef.current.style.color = "red";

        setTimeout(() => {
          spanRef.current.innerHTML = "Upload File";
          spanRef.current.style.color = "black";
        }, 3000);
      });
  };

  // Image Type Handling
  const onSaveCropped = (file: File) => {
    setFile(file);
    setOpenImageCropper(false);

    console.log("[Upload] Sending file to the server...", file);

    axiosPost(file, "/api/fileupload")
      .then((response) => {
        console.log("[Upload] File uploaded successfully!", response);
        callback(responseNormalizer(response, null, file));
      })
      .catch((error) => {
        callback(responseNormalizer(null, error, file));

        console.error("[Upload] Error uploading file to the server!", error);
        setFile(null);
      });
  };

  if (type === "image") {
    return (
      <div className="buttonImage flex">
        <input
          type="file"
          accept=".svg, .png, .jpeg, .jpg"
          style={{ display: "none" }}
          onChange={uploadImage}
          id="contained-button-file"
        />
        <label className="flex" htmlFor="contained-button-file">
          <img src={BoxImage} alt="Empty Box" className="box-image" />
        </label>

        {openImageCropper && src && (
          <Cropper
            src={src}
            name={(file && file.name.split(".")[0]) || "image"}
            onSave={onSaveCropped}
            config={config}
          />
        )}
      </div>
    );
  }

  // File Type Handling
  const handleClick = (_event: any) => {
    hiddenFileInput.current.click();
    spanRef.current.innerHTML = "Loading...";
  };

  return (
    <div className="flex buttonFile" onClick={handleClick}>
      <input
        accept=".doc, .docx, .pdf, .ppt, .pptx, .xls, .xlsx, .txt, .svg, .png, .jpeg, .jpg"
        type="file"
        ref={hiddenFileInput}
        onChange={uploadImage}
        style={{ display: "none" }}
      />
      {/* <span ref={spanRef}>Upload File</span> */}
      <button ref={spanRef} className="upload-button">+ Add</button>
    </div>
  );
};

// Defining default prop values
Upload.defaultProps = {
  type: "file",
  iconSrc: "https://img.icons8.com/ios/256/camera--v3.png",
  strategy: (file: File) => {
    console.error("[Upload] Strategy not defined!", file);
  },
  config: {
    maxZoom: 10,
    aspectRatio: 4 / 3,
  },
};

export default Upload;
