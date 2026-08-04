import addressModel from "../models/address.model.js";

export const addAddress = async function (req, res) {
    try {
        let { fullName, mobileNumber, addressLine1, addressLine2, city, state, country, landmark, pincode } = req.body;

        if (!fullName || !mobileNumber || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit mobile number."
            });
        }

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit pincode."
            });
        }

        const isAddressExists = await addressModel.findOne({
            user: req.user._id,
            addressLine1,
            city,
            state,
            pincode
        });

        if (isAddressExists) {
            return res.status(409).json({
                message: "This address already exists."
            });
        }

        const savedAddress = await addressModel.create({
            user: req.user._id,
            fullName,
            mobileNumber,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            country,
            pincode
        })

        return res.status(201).json({
            message: "Address added successfully.",
            savedAddress: savedAddress
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }

}

export const getAllAddress = async function (req, res) {
    try {
        let userAddresses = await addressModel.find({ user: req.user._id });

        return res.status(200).json({
            message: "Addresses fetched successfully.",
            addresses: userAddresses
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        })
    }
}

export const getAddressById = async function (req, res) {
    try {
        let { id } = req.params;

        if (!id) {
            return res.status({
                message: "Id is required"
            })
        }
        let savedAddress = await addressModel.findOne({ _id: id });

        if (!savedAddress) {
            return res.status(404).json({
                message: "Address not found"
            })
        }

        return res.status(200).json({
            message: "Address fetched successfully",
            address: savedAddress
        })

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }

}

export const updateAddress = async function (req, res) {
    try {
        const { fullName, mobileNumber, addressLine1, addressLine2, landmark, city, state, country, pincode, addressType } = req.body;

        const { id } = req.params;

        // Check Address ID
        if (!id) {
            return res.status(400).json({
                message: "Address id is required."
            });
        }

        // Required Fields Validation
        if (!fullName || !mobileNumber || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                message: "All required fields are mandatory."
            });
        }

        // Mobile Number Validation
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!mobileRegex.test(mobileNumber)) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit mobile number."
            });
        }

        // Pincode Validation
        const pincodeRegex = /^\d{6}$/;

        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit pincode."
            });
        }

        // Check Address Exists
        const address = await addressModel.findById(id);

        if (!address) {
            return res.status(404).json({
                message: "Address not found."
            });
        }


        // Update Address
        address.fullName = fullName;
        address.mobileNumber = mobileNumber;
        address.addressLine1 = addressLine1;
        address.addressLine2 = addressLine2;
        address.landmark = landmark;
        address.city = city;
        address.state = state;
        address.country = country;
        address.pincode = pincode;
        address.addressType = addressType;

        await address.save();

        return res.status(200).json({
            message: "Address updated successfully.",
            updatedAddress: address
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong.",
            error: err.message
        });
    }
};

export const deleteAddress = async function (req, res) {
    try {
        let { id } = req.params;

        if (!id) {
            return res.status({
                message: "Id is required"
            })
        }
        let userAddress = await addressModel.findOne({ _id: id });

        if (!userAddress) {
            return res.status(404).json({
                message: "Address not found"
            })
        }

        let deletedAddress = await addressModel.deleteOne({ _id: id });

        return res.status(200).json({
            message: "Address deleted successfully",
            address: deletedAddress
        })

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }
}

export const setDefaultAddress = async function (req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Address id is required."
            });
        }

        const savedAddress = await addressModel.findById(id);

        if (!savedAddress) {
            return res.status(404).json({
                message: "Address not found."
            });
        }

        // Remove default from all user's addresses
        await addressModel.updateMany(
            { user: req.user._id },
            { $set: { isDefault: false } }
        );

        // Set selected address as default
        savedAddress.isDefault = true;
        await savedAddress.save();

        return res.status(200).json({
            message: "Default address updated successfully.",
            defaultAddress: savedAddress
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong.",
            error: err.message
        });
    }
};