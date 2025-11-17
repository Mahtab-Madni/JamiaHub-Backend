import express from 'express';
import multer from 'multer';
import { protectRoute } from "../middleware/authmiddleware.js";
import { addBlogs, addevents, addLike, addresources, blogs, deleteresources, delEvent, editresources, getEvents, getresources, getsubjects, remLike } from '../controller/admincontroller.js';
import { addsubjects } from '../controller/admincontroller.js';

const adminRouter = express.Router();

// Use memory storage for Vercel
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

adminRouter.post('/add-resource', protectRoute, addresources);
adminRouter.post('/addEvent', protectRoute, upload.single('image'), addevents);
adminRouter.post('/add-Blog', protectRoute, upload.single('image'), addBlogs);
adminRouter.get('/blogs', blogs);
adminRouter.get('/events', getEvents);
adminRouter.post('/delEvent/:eventId', protectRoute, delEvent);
adminRouter.post('/addLike/:blogId', protectRoute, addLike);
adminRouter.post('/remLike/:blogId', protectRoute, remLike);
adminRouter.post('/delete-resource/:resourceId', protectRoute, deleteresources);
adminRouter.post('/edit-resource', protectRoute, editresources);
adminRouter.get('/get-resources', getresources);
adminRouter.get('/subjects', getsubjects);
adminRouter.post('/add-subjects', protectRoute, addsubjects);

export default adminRouter;