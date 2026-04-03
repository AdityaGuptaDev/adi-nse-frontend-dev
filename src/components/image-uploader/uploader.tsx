"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiXCircle } from "react-icons/fi";
import { DndProvider } from "react-dnd";
import { handleServerError, toastAlert } from "@/utils/helpers";
import { useDropzone } from "react-dropzone";
import api from "@/utils/api";
import CustomLabel from "@/commonUI/Label";
import { NODE_API_URL, max1MBSizeInBytes } from "@/utils/constants";
import CustomText from "@/commonUI/Text";
import CustomButton from "@/commonUI/Button";

function Uploader({ setImageUrl, imageUrl, multiple, folder, icon, size, title, handleEvent, sizeText }: any) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const imageModalRef = useRef<HTMLDialogElement>(null);

  const imageOpenModal = () => {
    imageModalRef.current?.showModal();
  };

  const imageCloseModal = () => {
    imageModalRef.current?.close();
  };

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: multiple ? true : false,
    maxSize: 50000000,
    maxFiles: 2,
    onDrop: (acceptedFiles: any) => {
      setFiles(acceptedFiles);
    },
  });

  useEffect(() => {
    if (fileRejections) {
      fileRejections.map(({ file, errors }: any) => (
        <li key={file.path}>
          {file.path} - {file.size} bytes
          <ul>
            {errors.map((e: any) => (
              <li key={e.code}></li>
            ))}
          </ul>
        </li>
      ));
    }

    if (files) {
      files.forEach((file: any) => {

        if (file && (file.name.includes("gif") || file.name.includes("jfif"))) {
          return toastAlert("error", "GIF, JFIF images are not allowed.");
        }

        if (size) {
          if (file.size > size) {
            return toastAlert("error", "Please Upload file lessthen 1 MB...");
          }
        }


        setLoading(true);
        setError("Uploading....");

        const name = file.name.replaceAll(/\s/g, "");
        const public_id = name?.substring(0, name.lastIndexOf("."));

        const formData = new FormData();
        formData.append("folder", folder);
        formData.append("public_id", public_id);
        formData.append("FILE", file);

        api
          .post(`/upload/uploadImages`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res: any) => {
            console.log(res, "resresresres");
            toastAlert("success", "Image Uploaded successfully!");
            setLoading(false);
            if (multiple) {
              setImageUrl((imgUrl: any) => [
                ...imgUrl,
                // res.data.data.secure_url,
                res.data.data.fileName,
              ]);
            } else {
              // setImageUrl(res.data.data.secure_url);
              setImageUrl(res.data.data.fileName);
              handleEvent(res.data.data.fileName)
            }
          })
          .catch((err: any) => {
            if (err.status === 400) {
              toastAlert("error", err?.response?.data?.message);
            }
            toastAlert("error", err.msg);
            setLoading(false);
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const thumbs = files.map((file: any) => (
    <div key={file.name}>
      <div>
        <img
          className="inline-flex border-2 border-gray-100 w-24 max-h-24"
          src={file.preview}
          alt={file.name}
        />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const handleRemoveImage = async (img: any) => {
    try {
      setLoading(false);
      toastAlert("error", "Image delete successfully!");
      if (multiple) {
        const result = imageUrl?.filter((i: any) => i !== img);
        setImageUrl(result);
      } else {
        setImageUrl("");
      }
    } catch (err: any) {
      console.error("err", err);
      handleServerError(err);
      toastAlert("error", err.Message);
      setLoading(false);
    }
  };

  return (
    <div>
      {title && (
        <div className="flex justify-between">
          <div className="flex-1">
            <CustomLabel className="text-sm font-medium">{title}</CustomLabel>
            <CustomText className="text-xs">{sizeText}</CustomText>
          </div>
        </div>
      )}

      <div className="w-full text-center">
        <div
          className="relative border border-gray-300 border-dashed rounded-md cursor-pointer px-0 py-0 mt-3 h-52"
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          {/* Show image preview inside dropzone if image exists */}
          {!multiple && imageUrl ? (
            <div className="relative">
              <img
                className="mx-auto border-0 rounded-md border-gray-300 max-h-50 mb-4 object-contain"
                src={`${NODE_API_URL}/static/${folder}/${imageUrl}`}
                width="800px"
                alt="product"
              />
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-1 focus:outline-none cursor-pointer shadow-md"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropzone click
                  handleRemoveImage(imageUrl);
                }}
              >
                <FiXCircle size={16} />
              </button>
              <div className="flex justify-center mt-5">
              <CustomButton className="bg-secondary hover:bg-secondary/80 text-white px-3 p-2 "
                    >Click to change image</CustomButton>
              </div>
            </div>
          ) : (
            // Show upload UI when no image
            <>
              {/* <span className="mx-auto flex justify-center">{icon}</span> */}
              <div className="text-sm mt-2 text-gray-400 h-52 flex items-center justify-center"><div className="bg-secondary rounded-lg p-2 text-white">Upload Image</div></div>
            </>
          )}

          {/* <em className="text-xs text-gray-400">
          (Only *.jpeg, *.webp and *.png images will be accepted)
        </em> */}
        </div>

        {/* {imageUrl ? <div className="text-xl text-green-600 mt-4">Image Upload Successfully!</div> : null } */}

        {/* <dialog id="my_modal_3" className="modal" ref={imageModalRef}>
          <div className="modal-box">
            <form method="dialog" className="flex justify-between">
              <CustomText className="text-lg font-montserrat font-semibold">Image</CustomText>
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <div className="mt-5 p-5 text-center justify-center flex ">
              <img src={`${NODE_API_URL}/static/${folder}/${imageUrl}`} />
            </div>
          </div>
        </dialog> */}
      </div>
    </div>
  );
}

export default Uploader;
