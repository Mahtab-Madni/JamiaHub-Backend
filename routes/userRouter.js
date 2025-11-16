import { Router } from "express";
import { createGroup,getAllGroups,getGroupsbyUser,leaveGroup,deleteGroup,editGroup, joinGroup, connectForm, getFeedback } from "../controller/usercontroller.js";
import { protectRoute } from "../middleware/authmiddleware.js";

const userRouter = Router();

userRouter.post("/creategroup",protectRoute, createGroup);

userRouter.get("/allGroups", getAllGroups);

userRouter.get("/groups",protectRoute, getGroupsbyUser);

userRouter.delete('/groups/:groupId', protectRoute, deleteGroup);

userRouter.patch('/groups/:groupId', protectRoute, editGroup);

userRouter.post('/groups/:groupId/leave', protectRoute, leaveGroup);

userRouter.post('/groups/:groupId/join', protectRoute, joinGroup);

userRouter.post('/feedback',getFeedback);

userRouter.post('/connect',connectForm);

export default userRouter;
