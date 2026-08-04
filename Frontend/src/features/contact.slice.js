import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createContactApi, getAllContactsApi, getContactByIdApi, getContactsStatsApi, updateAdminNotesApi, updateContactStatusApi, markAsReadApi, deleteContactApi,getUserContactRequestsApi } from "../api/contact.api";

const initialState = {
    contacts: [],
    selectedContact: null,
    userContactRequests:[],

    contactStats: {
        totalContacts: 0,
        pendingContacts: 0,
        resolvedContacts: 0,
        inProgressContacts: 0,
        closedContacts: 0,
        readContacts: 0,
        unreadContacts: 0,
        todayMessages: 0,
        thisWeekMessages: 0,
        thisMonthMessages: 0,
    },

    loading: false,
    error: null,
};

export const createContact = createAsyncThunk(
    "/contact/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await createContactApi(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Failed to create contact"
            );
        }
    }
)

export const getContacts = createAsyncThunk("/contact/get", async () => {
    const response = await getAllContactsApi();
    return response.contacts;
})

export const getContactById = createAsyncThunk("/contact/getById", async (id) => {
    const response = await getContactByIdApi(id);
    return response.contact;
})

export const deleteContact = createAsyncThunk("/contact/delete", async (id) => {
    const response = await deleteContactApi(id);
    return response._id;
})

export const updateAdminNotes = createAsyncThunk("/contact/updateNotes", async ({ id, payload }) => {
    const response = await updateAdminNotesApi(id, payload);
    return response.updatedContact;
})

export const updateContactStatus = createAsyncThunk("/contact/updateStatus", async ({ id, payload }) => {
    const response = await updateContactStatusApi(id, payload);
    return response.updatedContact;
})

export const markAsReadContact = createAsyncThunk("/contact/markAsRead", async (id) => {
    const response = await markAsReadApi(id);
    return response.updatedContact;
})

export const getContactStats = createAsyncThunk("/contact/stats", async () => {
    const response = await getContactsStatsApi();
    return response.contactStats;
})

export const getUserContactRequests = createAsyncThunk("/contact/request", async () => {
    const response = await getUserContactRequestsApi();
    return response.contactRequests;
})

export const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // CREATE CONTACT CASES
            .addCase(createContact.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createContact.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload?.contact) {
                    state.contacts.push(action.payload.contact);
                }
            })

            .addCase(createContact.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create contact";
            })

            // GET CONTACTS CASES

            .addCase(getContacts.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.contacts = action.payload;
            })

            .addCase(getContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to fetch contacts";
            })

            // GET CONTACTS BY ID CASES

            .addCase(getContactById.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getContactById.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.selectedContact = action.payload;
            })

            .addCase(getContactById.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to fetch contact";
            })

            // DELETE CONTACT CASES

            .addCase(deleteContact.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(deleteContact.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.contacts = state.contacts.filter(
                    (element) => element._id !== action.payload
                );
            })

            .addCase(deleteContact.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to delete Contact";
            })

            // UPDATE ADMIN NOTES

            .addCase(updateAdminNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateAdminNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;

                const updatedContact = action.payload;
                if (!updatedContact?._id) {
                    return;
                }

                state.contacts = state.contacts.map((contact) =>
                    contact._id === updatedContact._id
                        ? updatedContact
                        : contact
                );

                if (state.selectedContact?._id === updatedContact._id) {
                    state.selectedContact = updatedContact;
                }
            })

            .addCase(updateAdminNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to update admin notes.";
            })

            // UPDATE CONTACT STATUS

            .addCase(updateContactStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateContactStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;

                const updatedContact = action.payload;
                if (!updatedContact?._id) {
                    return;
                }

                state.contacts = state.contacts.map((contact) =>
                    contact._id === updatedContact._id
                        ? updatedContact
                        : contact
                );

                if (state.selectedContact?._id === updatedContact._id) {
                    state.selectedContact = updatedContact;
                }
            })

            .addCase(updateContactStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to update contact status.";
            })

            // MARK AS READ CASES

            .addCase(markAsReadContact.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(markAsReadContact.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;

                state.contacts = state.contacts.map((contact) =>
                    contact._id === action.payload._id
                        ? {
                            ...contact,
                            isRead: true
                        }
                        : contact
                );
            })

            .addCase(markAsReadContact.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to mark contact as read.";
            })

            // GET CONTACT STATS CASES

            .addCase(getContactStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getContactStats.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.contactStats = action.payload
            })

            .addCase(getContactStats.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to mark contact as read.";
            })


            // GET USER CONTACT REQUESTS CASES

            .addCase(getUserContactRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getUserContactRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.userContactRequests = action.payload
            })

            .addCase(getUserContactRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = "Failed to fetch contacts.";
            })
    }
});

export default contactSlice.reducer;