'use client';

import { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiStar } from 'react-icons/fi';

interface UploadedImage {
    id?: number;
    url: string;
    filename?: string;
    is_primary?: boolean;
    file?: File;
    preview?: string;
}

interface ImageUploadProps {
    productId?: string;
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
    maxImages?: number;
}

export function ImageUpload({ productId, images, onChange, maxImages = 6 }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const remainingSlots = maxImages - images.length;
        const filesToAdd = Array.from(files).slice(0, remainingSlots);

        const newImages: UploadedImage[] = filesToAdd.map((file, index) => ({
            url: URL.createObjectURL(file),
            preview: URL.createObjectURL(file),
            file,
            is_primary: images.length === 0 && index === 0,
        }));

        onChange([...images, ...newImages]);
    }, [images, maxImages, onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleRemove = (index: number) => {
        const imageToRemove = images[index];
        if (imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }

        const newImages = images.filter((_, i) => i !== index);

        // If we removed the primary, set the first remaining as primary
        if (imageToRemove.is_primary && newImages.length > 0) {
            newImages[0].is_primary = true;
        }

        onChange(newImages);
    };

    const handleSetPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            is_primary: i === index,
        }));
        onChange(newImages);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Product Images
                <span className="font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
                    ({images.length}/{maxImages})
                </span>
            </label>

            {/* Dropzone */}
            {images.length < maxImages && (
                <div
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                    style={{
                        borderColor: isDragging ? '#3b82f6' : 'var(--border)',
                        backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                    }}
                >
                    <FiUpload
                        className="w-10 h-10"
                        style={{ color: isDragging ? '#3b82f6' : 'var(--text-muted)' }}
                    />
                    <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Drop images here or click to browse
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            JPEG, PNG, WebP • Max 5MB each
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />
                </div>
            )}

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all group"
                            style={{
                                borderColor: image.is_primary ? '#3b82f6' : 'var(--border)',
                                boxShadow: image.is_primary ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
                            }}
                        >
                            <img
                                src={image.preview || image.url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Primary badge */}
                            {image.is_primary && (
                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <FiStar className="w-3 h-3" />
                                    Main
                                </div>
                            )}

                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!image.is_primary && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimary(index)}
                                        className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                                        title="Set as main image"
                                    >
                                        <FiStar className="w-4 h-4 text-blue-600" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                                    title="Remove image"
                                >
                                    <FiX className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {images.length === 0 && (
                <p className="text-sm text-center py-2" style={{ color: 'var(--text-muted)' }}>
                    Add photos to make your listing stand out
                </p>
            )}
        </div>
    );
}
