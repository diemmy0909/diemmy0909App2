import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotify, useRedirect } from 'react-admin';
import axios from 'axios';
import './css/ProductImageUpdate.css';

const ProductImageUpdate = () => {
    const { id } = useParams();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const notify = useNotify();
    const redirect = useRedirect();
    const token = localStorage.getItem('jwt-token');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) { notify('Please select a file.'); return; }
        const formData = new FormData();
        formData.append('image', file);
        try {
            await axios.put(`http://localhost:8080/api/admin/products/${id}/image`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            notify('Image updated successfully.');
            redirect('/products');
        } catch (error) { notify('Error updating image.'); }
    };

    return (
        <div className="container">
            <h2>Cập nhật hình ảnh cho sản phẩm {id}</h2>
            <div className="image-preview">
                {preview ? <img src={preview} alt="Preview" className="preview-img" /> : <p>Chưa có hình ảnh</p>}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} className="upload-button">Cập nhật</button>
        </div>
    );
};
export default ProductImageUpdate;