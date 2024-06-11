import fs from "fs/promises"

export async function deleteFile(filePath:string) {
    try {
      await fs.unlink(filePath);
      console.log(`File ${filePath} has been deleted.`);
    } catch (err) {
      console.error(err);
    }
  }