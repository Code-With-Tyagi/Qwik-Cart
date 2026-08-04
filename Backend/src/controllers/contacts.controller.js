import contactModel from "../models/contact.model.js";

export const createContact = async function (req, res) {
    try {

        const { fullName, email, phone, subject, message } = req.body;
        const allowedSubjects = [
            "Question about an order",
            "Product inquiry",
            "Other"
        ];

        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        if (!allowedSubjects.includes(subject)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject selected."
            });
        }

        // Create Contact
        const contact = await contactModel.create({
            user: req.user._id,
            fullName,
            email,
            phone,
            subject,
            message
        });

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            contact
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Failed to submit contact request.",
            error: err.message
        });

    }
};

export const getAllContacts = async function (req, res) {

    try {
        let contacts = await contactModel.find({});

        if (!contacts) {
            return res.status(200).json({
                success: true,
                message: "No contacts found.",
                contacts: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contacts fetched successfully",
            contacts: contacts
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }

}

export const getContactById = async function (req, res) {
    try {
        let { id } = req.params;
        let contact = await contactModel.findById(id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        return res.status(200).json({
            message: "Contact fetched successfully",
            contact: contact
        })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }


    res.status(200).json({
        message: "Id fetched successfully"
    })
}

export const deleteContact = async function (req, res) {
    try {
        let { id } = req.params;
        let isContactExists = await contactModel.findById(id);

        if (!isContactExists) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        let contact = await contactModel.deleteOne({
            _id: id
        });

        return res.status(200).json({
            message: "Contact deleted successfully",
            contactDeleted: contact
        });
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        })
    }
}

export const updateContactStatus = async function (req, res) {
    try {
        let { id } = req.params;
        let { status } = req.body;

        const validStatuses = [
            "Pending",
            "In Progress",
            "Resolved",
            "Closed"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status."
            });
        }

        let contact = await contactModel.findByIdAndUpdate(id, {
            status: status
        }, {
            new: true
        }
        )

        return res.status(200).json({
            message: "Contact status updated successfully",
            updatedContact: contact
        })

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Failed to update contact status.",
            error: err.message
        });

    }
}

export const markContactAsRead = async function (req, res) {
    try {
        let { id } = req.params;

        let isContactExists = await contactModel.findById(id);

        if (!isContactExists) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        let contact = await contactModel.findByIdAndUpdate(id, {
            isRead: true
        }, {
            new: true
        })

        return res.status(200).json({
            message: "Contact marked as read successfully.",
            updatedContact: contact
        })


    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }
}

export const updateAdminNotes = async function (req, res) {
    try {

        const { id } = req.params;
        const { notes } = req.body;

        let isContactExists = await contactModel.findById(id);

        if (!isContactExists) {
            return res.status(404).json({
                message: "Contact not found"
            })
        }

        const updatedContact = await contactModel.findByIdAndUpdate(
            id,
            {
                notes: typeof notes === "string" ? notes.trim() : ""
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin notes updated successfully.",
            updatedContact
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err.message
        });

    }
}

export const getContactStats = async function (req, res) {
    try {

        // Today's Date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start of Current Week (Sunday)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Start of Current Month
        const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        const [
            totalContacts,
            pendingContacts,
            resolvedContacts,
            inProgressContacts,
            closedContacts,
            readContacts,
            unreadContacts,
            todayMessages,
            thisWeekMessages,
            thisMonthMessages
        ] = await Promise.all([

            contactModel.countDocuments(),

            contactModel.countDocuments({ status: "Pending" }),

            contactModel.countDocuments({ status: "Resolved" }),

            contactModel.countDocuments({ status: "In Progress" }),

            contactModel.countDocuments({ status: "Closed" }),

            contactModel.countDocuments({ isRead: true }),

            contactModel.countDocuments({ isRead: false }),

            contactModel.countDocuments({
                createdAt: {
                    $gte: today
                }
            }),

            contactModel.countDocuments({
                createdAt: {
                    $gte: startOfWeek
                }
            }),

            contactModel.countDocuments({
                createdAt: {
                    $gte: startOfMonth
                }
            })

        ]);

        return res.status(200).json({
            success: true,
            message: "Contact statistics fetched successfully.",
            contactStats: {
                totalContacts,
                pendingContacts,
                resolvedContacts,
                inProgressContacts,
                closedContacts,
                readContacts,
                unreadContacts,
                todayMessages,
                thisWeekMessages,
                thisMonthMessages
            }
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err.message
        });

    }
};

export const getUserContactRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const contactRequests = await contactModel.find({ user: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Contact fetched successfully",
            contactRequests: contactRequests,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

