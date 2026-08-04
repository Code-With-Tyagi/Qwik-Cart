import React from 'react';

const ProductSpecifications = ({ product }) => {
    // If there's no product or no specifications to show, don't render anything
    if (!product) return null;

    return (
        <div className="mt-12 lg:mt-16">
            
            {/* Classic, clean header */}
            <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200">
                    Product Specifications
                </h2>
            </div>
            
            {/* Professional Tabular Layout Container */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="flex flex-col">
                    
                    {/* Brand */}
                    {product.brand && (
                        <div className="flex flex-col sm:flex-row border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="w-full sm:w-1/3 lg:w-1/4 bg-gray-50/80 sm:bg-gray-50 py-3 px-4 text-sm font-medium text-gray-600 sm:border-r border-gray-200">
                                Brand
                            </div>
                            <div className="w-full sm:w-2/3 lg:w-3/4 py-3 px-4 text-sm text-gray-900">
                                {product.brand}
                            </div>
                        </div>
                    )}

                    {/* Dimensions */}
                    {product.dimensions && (
                        <div className="flex flex-col sm:flex-row border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="w-full sm:w-1/3 lg:w-1/4 bg-gray-50/80 sm:bg-gray-50 py-3 px-4 text-sm font-medium text-gray-600 sm:border-r border-gray-200">
                                Dimensions (W x H x D)
                            </div>
                            <div className="w-full sm:w-2/3 lg:w-3/4 py-3 px-4 text-sm text-gray-900">
                                {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
                            </div>
                        </div>
                    )}

                    {/* Weight */}
                    {product.weight && (
                        <div className="flex flex-col sm:flex-row border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="w-full sm:w-1/3 lg:w-1/4 bg-gray-50/80 sm:bg-gray-50 py-3 px-4 text-sm font-medium text-gray-600 sm:border-r border-gray-200">
                                Item Weight
                            </div>
                            <div className="w-full sm:w-2/3 lg:w-3/4 py-3 px-4 text-sm text-gray-900">
                                {product.weight}
                            </div>
                        </div>
                    )}

                    {/* Warranty */}
                    {product.warrantyInformation && (
                        <div className="flex flex-col sm:flex-row border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="w-full sm:w-1/3 lg:w-1/4 bg-gray-50/80 sm:bg-gray-50 py-3 px-4 text-sm font-medium text-gray-600 sm:border-r border-gray-200">
                                Warranty Details
                            </div>
                            <div className="w-full sm:w-2/3 lg:w-3/4 py-3 px-4 text-sm text-gray-900">
                                {product.warrantyInformation}
                            </div>
                        </div>
                    )}

                    {/* Tags / Categories (Rendered as a standard list) */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-col sm:flex-row border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="w-full sm:w-1/3 lg:w-1/4 bg-gray-50/80 sm:bg-gray-50 py-3 px-4 text-sm font-medium text-gray-600 sm:border-r border-gray-200">
                                Categories
                            </div>
                            <div className="w-full sm:w-2/3 lg:w-3/4 py-3 px-4 text-sm text-gray-900 capitalize">
                                {product.tags.join(', ')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
           
        </div>
    );
};

export default ProductSpecifications;