import express from "express";
import { createContact, getAllContacts, updateContactStatus, markContactAsRead, updateAdminNotes, deleteContact, getContactStats, getContactById,getUserContactRequests } from "../controllers/contacts.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
let router = express();

router.post("/", isAuthenticated, createContact);

router.get("/", isAuthenticated, isAdmin, getAllContacts);

router.get("/me/contact-requests", isAuthenticated, getUserContactRequests);

router.get("/stats", isAuthenticated, isAdmin, getContactStats);

router.get("/:id", isAuthenticated, isAdmin, getContactById);

router.patch("/:id/status", isAuthenticated, isAdmin, updateContactStatus);

router.patch("/:id/read", isAuthenticated, isAdmin, markContactAsRead);

router.patch("/:id/note", isAuthenticated, isAdmin, updateAdminNotes);

router.delete("/:id", isAuthenticated, isAdmin, deleteContact);


export default router;