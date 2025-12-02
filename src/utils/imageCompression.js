// Image compression utility for optimizing uploads
export const compressImage = async (file, maxSizeMB = 0.5, maxWidthOrHeight = 1920) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidthOrHeight) {
                        height *= maxWidthOrHeight / width;
                        width = maxWidthOrHeight;
                    }
                } else {
                    if (height > maxWidthOrHeight) {
                        width *= maxWidthOrHeight / height;
                        height = maxWidthOrHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Try different quality levels to meet size target
                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
                                quality -= 0.1;
                                tryCompress();
                            } else {
                                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };
                tryCompress();
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
