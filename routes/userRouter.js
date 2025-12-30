import { Router } from "express";
import { createGroup,getAllGroups,getGroupsbyUser,leaveGroup,deleteGroup,editGroup, joinGroup, connectForm, getFeedback, updateProfile, getProfile } from "../controller/usercontroller.js";
import { protectRoute } from "../middleware/authmiddleware.js";
import multer from "multer";

const userRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


userRouter.post("/creategroup",protectRoute, createGroup);

userRouter.get("/allGroups", getAllGroups);

userRouter.get("/groups",protectRoute, getGroupsbyUser);

userRouter.delete('/groups/:groupId', protectRoute, deleteGroup);

userRouter.patch('/groups/:groupId', protectRoute, editGroup);

userRouter.post('/groups/:groupId/leave', protectRoute, leaveGroup);

userRouter.post('/groups/:groupId/join', protectRoute, joinGroup);

userRouter.post('/feedback',getFeedback);

userRouter.post('/connect',connectForm);

userRouter.put('/profile', protectRoute, updateProfile).get('/profile',upload.single('image'), protectRoute, getProfile);


export default userRouter;
