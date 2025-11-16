import User from '../Models/user.js';
import Group from '../Models/Groups.js';
import { StreamChat } from 'stream-chat';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import Connect from '../Models/Connect.js';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export async function createGroup(req, res) {
  const Admin = req.user.id;
  const { GroupName, members , icon } = req.body;
  if (!GroupName || !Admin || !members || !icon ) {
    return res.status(400).json({ message: "GroupName, Admin, and members are required" });
  }
  try {
    // 1. Ensure all users exist in MongoDB and Stream
    const allmembers = [...new Set([...members, Admin])];
    const users = await User.find({ _id: { $in: allmembers } });

    if (users.length !== allmembers.length) {
        return res.status(404).send('One or more users not found in database');
    }
    
    // Sync all members to Stream
    const syncUserToStream = async (userId, name) => {
      await streamClient.upsertUser({
        id: userId.toString(),
        name: name
      });
    };

    await Promise.all(users.map(u => syncUserToStream(u._id, u.name)));

    // 2. Create the channel in Stream Chat
    const channelId = `group_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const channel = streamClient.channel('messaging', channelId, {
        name: GroupName,
        members: allmembers,
        created_by_id: Admin,
    });

    // Create the channel in Stream (upsert)
    await channel.create();
    console.log(`Stream channel ${channelId} created.`);

    // 3. Save the new group information to MongoDB
    const newGroup = new Group({
      _id: channelId, // Use the channel ID as the group ID
      GroupName: GroupName,
      members: allmembers,
      Admin : Admin,
      icon: icon,
      streamChatId: channelId,
    });

    await newGroup.save();

    res.status(201).json({
      message: 'Group chat created successfully',
      groupId: newGroup._id,
      streamChatId: channel.id,
    });

  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).send('Internal Server Error');
  }
}

export async function getAllGroups(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      Group.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'Admin',
            foreignField: '_id',
            as: 'adminDetails'
          }
        },
        {
          $addFields: {
            totalMembers: { $size: '$members' },
            Admin: { $arrayElemAt: ['$adminDetails', 0] },
            icon: { $ifNull: ['$icon', '💬'] }
          }
        },
        {
          $project: {
            GroupName: 1,
            icon: 1,
            members: 1, 
            totalMembers: 1,
            streamChatId: 1,
            createdAt: 1,
            updatedAt: 1,
            'Admin.name': 1,
            'Admin.email': 1,
            'Admin._id': 1
          }
        }
      ]),
      Group.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      groups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGroups: total
      }
    });
  } catch (error) {
    console.error('Error fetching all groups:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getGroupsbyUser(req, res) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      Group.find({ members: userId })
        .populate('members', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      Group.countDocuments({ members: userId })
    ]);

    res.status(200).json({
      success: true,
      groups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGroups: total
      }
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteGroup(req, res) {
  try {
    const adminId = req.user.id;
    const { groupId } = req.params;

    // Find the group and check if it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if the requesting user is the admin
    if (group.Admin.toString() !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the group admin can delete the group' 
      });
    }

    // Delete the channel from Stream Chat
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.delete();

    // Delete the group from MongoDB
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function editGroup(req, res) {
  try {
    const adminId = req.user.id;
    const { groupId } = req.params;
    const { groupName, removeMember, addMembers } = req.body;

    // Find the group and check if it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if the requesting user is the admin
    if (group.Admin.toString() !== adminId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the group admin can edit the group' 
      });
    }

    // Initialize update object
    const updates = {};
    const streamUpdates = {};

    // Handle group name update
    if (groupName && groupName !== group.name) {
      updates.name = groupName;
      streamUpdates.name = groupName;
    }

    // Handle member removal
    if (removeMember) {
      // Prevent removing the admin
      if (removeMember === adminId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the group admin'
        });
      }

      // Check if the member exists in the group
      if (!group.members.includes(removeMember)) {
        return res.status(400).json({
          success: false,
          message: 'Member not found in the group'
        });
      }

      updates.members = group.members.filter(
        memberId => memberId.toString() !== removeMember
      );
    }

    // Handle adding new members
    if (addMembers && Array.isArray(addMembers) && addMembers.length > 0) {
      // Verify all new members exist in the database
      const newUsers = await User.find({ _id: { $in: addMembers } });
      if (newUsers.length !== addMembers.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more users not found'
        });
      }

      // Add new members to existing members, removing duplicates
      const allMembers = [...new Set([...group.members.map(m => m.toString()), ...addMembers])];
      updates.members = allMembers;

      // Sync new users to Stream
      await Promise.all(newUsers.map(async (user) => {
        await streamClient.upsertUser({
          id: user._id.toString(),
          name: user.name
        });
      }));
    }

    // Update in MongoDB if there are changes
    if (Object.keys(updates).length > 0) {
      await Group.findByIdAndUpdate(groupId, updates, { new: true });
    }

    // Update in Stream Chat
    const channel = streamClient.channel('messaging', group.streamChannelId);
    
    if (updates.members) {
      // Update channel members in Stream
      await channel.updateMembers(updates.members.map(member => ({
        user_id: member.toString()
      })));
    }

    if (streamUpdates.name) {
      await channel.update({ name: streamUpdates.name });
    }

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      updates
    });

  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function leaveGroup(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    // Find the group and check if it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is actually a member of the group
    if (!group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Check if user is not the admin (admin cannot leave, they must delete the group or transfer ownership)
    if (group.Admin.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Group admin cannot leave the group. You must either delete the group or transfer ownership first.'
      });
    }

    // Remove user from group members in MongoDB
    await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );

    // Remove user from Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.removeMembers([userId.toString()]);

    res.status(200).json({
      success: true,
      message: 'Successfully left the group'
    });

  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function joinGroup(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    // Find the group and check if it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is already a member
    if (group.members.map(m => m.toString()).includes(userId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Ensure user exists in DB
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if group has a Stream Chat ID
    // Use streamChatId to match your frontend, or streamChannelId if that's your DB field
    const streamId = group.streamChatId || group.streamChannelId;
    
    if (!streamId) {
      console.error('Group does not have a Stream Chat ID');
      return res.status(400).json({
        success: false,
        message: 'This group chat is not properly configured'
      });
    }

    // Upsert user in Stream (id and name)
    try {
      await streamClient.upsertUser({ 
        id: userId.toString(), 
        name: user.name,
        image: user.profilePic || `https://ui-avatars.com/api/?name=${user.name}`
      });
      console.log('Stream: user upserted successfully');
    } catch (err) {
      console.error('Stream: failed to upsert user when joining group', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to configure chat user'
      });
    }

    // Add user to Stream channel members
    const channel = streamClient.channel('messaging', streamId);
    try {
      await channel.addMembers([userId.toString()]);
      console.log(`Stream: user ${userId} added to channel ${streamId}`);
    } catch (err) {
      console.error('Stream: failed to add member to channel', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add you to the chat channel'
      });
    }

    // Add user to MongoDB group members (use $addToSet to avoid duplicates)
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId, 
      { $addToSet: { members: userId } }, 
      { new: true }
    ).populate('members', 'name profilePic');

    console.log(`User ${userId} successfully joined group ${groupId}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully joined the group',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}

export async function getFeedback(req, res) {
  try {
    const { email, message } = req.body;
    
    if (!email || !message) {  
      return res.status(400).json({ message: "All fields are required" });
    }

    const newFeedback = new Connect({ email, message });
    await newFeedback.save();
    
    res.status(201).json({ 
      message: "Feedback submitted successfully", 
      feedback: newFeedback 
    });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function connectForm (req,res){
  try {
    const { name, email, message } = req.body;
    if ( !name || !email || !message ) {  
      return res.status(400).json({ message: "All fields are required" });
    }

    const newConnect = new Connect({ name, email, message});
    await newConnect.save();
    res.status(201).json({ message: "Form Submitted successfully", connect: newConnect });
  } catch (err) {
    console.error("Error submitting Form:", err);
    res.status(500).json({ message: "Server error" });
  }
}
