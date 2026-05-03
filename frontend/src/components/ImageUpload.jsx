import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onImageUpload, currentImageUrl, onRemove }) => {
    const [preview, setPreview] = useState(currentImageUrl || '');
    const [uploading, setUploading] = useState(false);

    // Compress image before converting to base64
    const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const compressedImage = await compressImage(file, 200, 200, 0.6);
            setPreview(compressedImage);
            onImageUpload(compressedImage);
        } catch (error) {
            console.error('Error compressing image:', error);
            alert('Failed to process image');
        } finally {
            setUploading(false);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1
    });

    return (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Product Image</label>
            
            {!preview ? (
                <div
                    {...getRootProps()}
                    style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '30px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#e3f2fd' : '#fafafa',
                        transition: 'all 0.3s',
                        marginBottom: '10px'
                    }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p style={{ color: '#007bff' }}>Drop the image here...</p>
                    ) : (
                        <div>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                            <p>Drag & drop an image here, or click to select</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>Supports: JPG, PNG, GIF (Max 2MB after compression)</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                    <img
                        src={preview}
                        alt="Product preview"
                        style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                        }}
                    />
                    <button
                        onClick={() => {
                            setPreview('');
                            onImageUpload('');
                            if (onRemove) onRemove();
                        }}
                        style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
            
            {uploading && (
                <p style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                    Processing image...
                </p>
            )}
            
            {/* Optional: Manual URL input as fallback */}
            <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                💡 Tip: Drag & drop an image file, or use URL below
            </div>
        </div>
    );
};

export default ImageUpload;