import React, { useState } from "react";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const ProfileImageUpload = () => {
    const [file, setFile] = useState(null); // State to hold the selected file
    const [imageUrl, setImageUrl] = useState(null); // State to hold the URL of the uploaded image

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) return;

        // Create a storage reference
        const storageRef = ref(storage, `profileImages/${file.name}`);

        // Upload the file
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitor the upload progress
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Track the upload progress (optional)
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                // Handle errors
                console.error("Upload failed", error);
            },
            () => {
                // Get the URL of the uploaded image once it's completed
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at", downloadURL);
                    setImageUrl(downloadURL); // Store the URL in the state
                });
            }
        );
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {imageUrl && <img src={imageUrl} alt="Uploaded profile" />}
        </div>
    );
};

export default ProfileImageUpload;