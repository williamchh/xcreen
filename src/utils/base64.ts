export function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Load the image file as a Data URL
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;

            // Resolve the promise once the image is loaded
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
        };

        // Handle errors while reading the file
        reader.onerror = (error) => reject(error);

        // Read the file
        reader.readAsDataURL(file);
    });
}

export function convertImageToBase64(image: HTMLImageElement): string {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(image, 0, 0);
    }

    // Get the Base64-encoded image data
    const base64String = canvas.toDataURL('image/png'); // The result will be a PNG format

    return base64String;
}

export function convertBase64ToImage(base64String: string): HTMLImageElement {
    const image = new Image();
    image.src = base64String;
    return image;
}

export function fileToBase64 (file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = () => {
            // reader.result contains the base64 string
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
    });
};

// Convert base64 string back to File
export function base64ToFile (
    base64String: string,
    fileName: string,
    mimeType: string
): File {
    // Convert base64 to binary data
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create Blob from binary data
    const blob = new Blob([bytes], { type: mimeType });
    
    // Create File from Blob
    return new File([blob], fileName, { type: mimeType });
};

// 2. Function to handle base64/generated files (convert to appropriate format)
export async function handleGeneratedImage (base64String: string) {
    try {
        // Method 1: Convert base64 to Image object first
        const image = new Image();
        image.src = `data:image/jpeg;base64,${base64String}`;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        // Create a canvas and draw the image
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0);

        // Get the canvas data as blob
        return await new Promise<Blob>(resolve => {
            canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 1.0);
        });

        
    } catch (error) {
        console.error('Error processing generated image:', error);
        throw error;
    }
};