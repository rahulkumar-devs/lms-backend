import cloudinary from "../configurations/cloudinary-connections"; // Ensure the path is correct

const deleteImageByUrl = async (url:string) => {
  try {
    // Extract the `public_id` from the URL
    const urlParts = url.split('/');
    const publicIdWithExtension = urlParts.slice(urlParts.indexOf('upload') + 2).join('/'); // Skip the 'upload' part
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // Remove file extension

    // Delete the image using the `public_id`
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Delete result:', result);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export default deleteImageByUrl;


