import express from 'express';
import multer from 'multer';
import { protectRoute } from "../middleware/authmiddleware.js";
import { addBlogs, addevents, addLike, addresources, blogs, deleteresources, delEvent, editresources, getEvents, getresources,  getsubjects, remLike } from '../controller/admincontroller.js';
import { addsubjects } from '../controller/admincontroller.js';

const adminRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

adminRouter.post('/add-resource',protectRoute, addresources);

adminRouter.post('/addEvent',protectRoute,upload.single('image'), addevents)

adminRouter.post('/add-Blog', protectRoute,upload.single('image'),addBlogs)

adminRouter.get('/blogs', blogs);

adminRouter.get('/events',getEvents);

adminRouter.post('/delEvent/:eventId',protectRoute,delEvent)

adminRouter.post('/addLike/:blogId',protectRoute, addLike);

adminRouter.post('/remLike/:blogId',protectRoute, remLike);

adminRouter.post('/delete-resource/:resourceId',protectRoute, deleteresources);

adminRouter.post('/edit-resource',protectRoute, editresources);

adminRouter.get('/get-resources', getresources);

adminRouter.get('/subjects', getsubjects);

adminRouter.post('/add-subjects',protectRoute,  addsubjects);

export default adminRouter;