import axios from "axios";

const productApi = axios.create({
    baseURL: "/api/product",
    withCredentials: true,
})

export const getProductsApi = async function () {
    try {
        console.log("Fetching all products...");
        const response = await productApi.get("/");
        console.log("Products fetched successfully");
        return response.data;
    } catch (err) {
        console.error("Fetch Products API Error:", err.response?.data || err.message);
        throw err.response?.data || err;
    }
}

export const getProductById = async function (id) {
    try {
        if (!id || id === "undefined" || id === "null") {
            throw new Error("A valid product id is required");
        }

        console.log("Fetching product ID:", id);
        const response = await productApi.get(`/${id}`);
        console.log("Product fetched successfully:", response.data);
        return response.data;
    } catch (err) {
        console.error("Fetch Product API Error:", err.response?.data || err.message);
        throw err.response?.data || err;
    }
}

export const updateProductApi=async function(id,payload){
    try {
        console.log("Updating product ID:", id);
        console.log("Update payload:", payload);
        
        // Handle tags - convert array to string if needed
        const updatePayload = { ...payload };
        if (Array.isArray(updatePayload.tags)) {
            updatePayload.tags = updatePayload.tags.join(',');
            console.log("Converted tags array to string:", updatePayload.tags);
        }
        
        const response = await productApi.put(`/update/${id}`, updatePayload);
        console.log("Update response:", response.data);
        return response.data;
    } catch (err) {
        console.error("Update API Error:", err.response?.data || err.message);
        throw err.response?.data || err;
    }
}

export const deleteProductApi=async function(id){
    try {
        const response=await productApi.delete(`/delete/${id}`);
        return response.data;
    } catch (err) {
        console.error("Delete API Error:", err.response?.data || err.message);
        throw err.response?.data || err;
    }
}

export const createProductApi=async function(payload){
    try {
        console.log("Creating product with payload:", payload);
        
        // Create FormData to send files
        const formData = new FormData();
        
        // Append all form fields except images
        Object.keys(payload).forEach(key => {
            if (key !== 'rawImages' && key !== 'images' && key !== 'dimensions') {
                if (Array.isArray(payload[key]) && key === 'tags') {
                    // For tags array, join into string
                    formData.append(key, payload[key].join(','));
                    console.log(`Appending tags: ${payload[key].join(',')}`);
                } else if (typeof payload[key] !== 'object') {
                    formData.append(key, payload[key]);
                    console.log(`Appending ${key}: ${payload[key]}`);
                }
            }
        });
        
        // Handle dimensions - flatten into separate fields (width, height, depth)
        if (payload.dimensions) {
            const { width, height, depth } = payload.dimensions;
            formData.append('width', width || 0);
            formData.append('height', height || 0);
            formData.append('depth', depth || 0);
            console.log(`Appending dimensions - width: ${width}, height: ${height}, depth: ${depth}`);
        }
        
        // Append image files - support both 'images' and 'rawImages' keys
        const imagesToUpload = payload.images || payload.rawImages;
        
        if (imagesToUpload && imagesToUpload.length > 0) {
            imagesToUpload.forEach((image) => {
                if (image instanceof File) {
                    formData.append('images', image); // Backend expects 'images' for multer
                    console.log(`Appending image file: ${image.name}`);
                }
            });
            console.log(`Total ${imagesToUpload.length} image(s) appended to FormData`);
        } else {
            console.warn("No images provided!");
            throw new Error("At least one product image is required");
        }
        
        const response = await productApi.post("/create", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("Product created successfully:", response.data);
        return response.data;
    } catch (err) {
        console.error("Create API Error:", err.response?.data || err.message);
        throw err.response?.data || err;
    }
}

export const getAllCategoriesApi=async function(){
    const response=await productApi.get("/categories");
    return response.data;
}