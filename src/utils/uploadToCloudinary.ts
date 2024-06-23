import { NextFunction, Request, Response } from "express";
import cloudinary from "../configurations/cloudinary-connections";
import fs from "fs";
import path from "path";

export interface IFileDetails {
  filePath: string;
  folder: string;
  width?: number;
  height?: number;
}

const uploadToCloudinary = async ({
  filePath,
  folder,
  width = 300,
  height = 300,
}: IFileDetails) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      // quality_analysis: true,
      resource_type:"auto",
      width: width,
      height: height,
    });

    const resultInfo = {
      public_id: result.public_id,
      url: result.url,
    };

    // Clean up the local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return resultInfo;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};

export default uploadToCloudinary;


// check file Already exist in cloudinary


// Function to check if a file exists in Cloudinary
export const checkFileExistsInCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Perform a search in Cloudinary using the public ID
    const searchResult = await cloudinary.search
      .expression(`public_id:${publicId}`)
      .execute();



    // If any results are returned, the file exists in Cloudinary
    return searchResult.total_count > 0;
  } catch (error) {
    console.error(`Error checking file existence in Cloudinary: ${publicId}`, error);
    throw new Error("Failed to check file existence in Cloudinary");
  }
};

export const deleteCloudinaryFile = async (publicId: string): Promise<boolean> => {
  try {

    return await cloudinary.uploader.destroy(publicId)

  } catch (error) {
    throw new Error("Failed to delete file existence in Cloudinary");

  }

}