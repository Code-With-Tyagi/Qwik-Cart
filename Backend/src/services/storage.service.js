import ImageKit from '@imagekit/nodejs';

const client = new ImageKit({
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY, // This is the default and can be omitted
});


export const uploadFile = async function (buffer, folder) {
    const response = await client.files.upload({
        file: buffer.toString("base64"),
        fileName: `image-${Date.now()}.jpg`,
        folder
    });

    return response;
};


export const deleteFile = async function (fileId) {
    return await client.files.delete(fileId);
}

