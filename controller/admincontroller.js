import Resource from '../Models/Resources.js';
import Subject from '../Models/Subjects.js';
import Event from '../Models/Events.js';
import Blog from '../Models/Blogs.js';
import mongoose from 'mongoose';


export async function addresources(req, res) {
  try {
    const { title,  link, branch, sem,subjectCode,type } = req.body;
    if (!title || !branch || !link || !sem || !subjectCode || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newResource = new Resource({ title, link, branch, sem,subjectCode,type, uploadedBy: req.user._id });
    await newResource.save();
    res.status(201).json({ message: "Resource added successfully", resource: newResource });
  } catch (err) {
    console.error("Error adding resource:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteresources(req, res) {
  try {
    const { resourceId } = req.params;
    
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID is required" });
    }

    // Validate if resourceId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: "Invalid resource ID format" });
    }

    // Find the resource
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Unauthorized: You can only delete your own resources" 
      });
    }

    // Delete the resource
    await Resource.findByIdAndDelete(resourceId);
    
    res.status(200).json({ 
      message: "Resource deleted successfully",
      deletedResourceId: resourceId 
    });
  }
  catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function editresources(req, res) {
  try {
    const { resourceId, title, link, branch, sem, subject, type } = req.body;
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID is required' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Only the uploader can edit the resource
    if (!resource.uploadedBy || resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: only the uploader can edit this resource' });
    }

    // Build update object from provided fields
    const updates = {};
    if (title) updates.title = title;
    if (link) updates.link = link;
    if (branch) updates.branch = branch;
    if (sem) updates.sem = sem;
    if (subject) updates.subject = subject;
    if (type) updates.type = type;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    // Validate enums are respected by Mongoose when saving
    Object.assign(resource, updates);
    await resource.save();

    res.status(200).json({ message: 'Resource updated successfully', resource });
  } catch (err) {
    console.error('Error editing resource:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getsubjects(req, res) {
  try {
    const { branch, sem } = req.query;
    if (!branch || !sem) {
      return res.status(400).json({ message: "Branch and Sem are required" });
    }
    const subjects = await Subject.find({ branch, sem });
    res.status(200).json({ subjects });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function addsubjects(req, res) {
  try {
    const {name, code, branch, sem, type} = req.body;
    
    if(!name || !code || !branch || !sem || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Check if subject with the same code, branch, and sem already exists
    const existingSubject = await Subject.findOne({ 
      code: code,
      branch: branch,
      sem: sem
    });
    
    if(existingSubject) {
      return res.status(409).json({ message: `Subject  '${code}' already exists for ${branch} ` });
    }
    
    const newSubject = new Subject({ name, code, branch, sem, type });
    await newSubject.save();
    
    res.status(201).json({ message: "Subject added successfully", subject: newSubject });
  } catch (err) {
    console.error("Error adding Subject:", err);
    res.status(500).json({ message: "Server error" });
  }
}
  
export async function getresources(req, res) {
  try {
    const { branch, sem, sub , type } = req.query;
    if (!branch || !sem || !sub || !type  ) {
      return res.status(400).json({ message: "Branch, Sem, Subject and type are required" });
    }
    const resources = await Resource.find({ subjectCode : sub , type: type});
    res.status(200).json({ resources });
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function addevents(req, res) {
  try {
    const { title, date, time, location, category, organizer, attendees, description, uploadedBy } = req.body;
    const imageFile = req.file;
    
    if (!title || !date || !time || !location || !category || !imageFile || !organizer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Convert buffer to base64 for serverless environment
    const imageUrl = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
    
    const newEvent = new Event({ 
      title, 
      date, 
      time, 
      location, 
      category, 
      image: imageUrl, 
      organizer, 
      attendees, 
      description, 
      uploadedBy 
    });
    
    await newEvent.save();
    res.status(201).json({ message: "Event added successfully", event: newEvent });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getEvents(req,res){
  try {
    const events = await Event.find().populate('uploadedBy', 'name email');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
}

export async function addBlogs(req,res){
  try {
    const { title, author, date, excerpt, tags, category, content } = req.body;
    const imageFile = req.file;
    
    if (!title || !author || !excerpt || !imageFile || !tags || !category || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Convert buffer to base64 for serverless environment
    const imageUrl = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
    
    const newBlog = new Blog({ 
      title, 
      author, 
      excerpt, 
      tags, 
      category,
      date,
      content, 
      image: imageUrl, 
      uploadedBy: req.user._id,
      likes: 0,
      likedBy: []
    });
    
    await newBlog.save();
    res.status(201).json({ message: "Blog added successfully", blog: newBlog });
  } catch (err) {
    console.error("Error adding blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function blogs(req, res) {
  try {
    const blogs = await Blog.find().populate('uploadedBy', 'name email');
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
}

export async function delEvent(req,res){
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Validate if resourceId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find the resource
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete the resource
    await Event.findByIdAndDelete(eventId);
    
    res.status(200).json({ 
      message: "Event deleted successfully",
      deletedEventId: eventId 
    });
  }
  catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function addLike(req, res) {
  try {
    const blogId = req.params.blogId;
    const userId = req.user._id;
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user already liked
    if (blog.likedBy.includes(userId)) {
      return res.status(400).json({ message: 'Already liked' });
    }
    
    blog.likedBy.push(userId);
    blog.likes += 1;
    await blog.save();
    
    res.status(200).json({ message: 'Blog liked', likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function remLike(req, res) {
  try {
    const blogId = req.params.blogId;
    const userId = req.user._id;
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user hasn't liked
    if (!blog.likedBy.includes(userId)) {
      return res.status(400).json({ message: 'Not liked yet' });
    }
    
    blog.likedBy = blog.likedBy.filter(id => id.toString() !== userId.toString());
    blog.likes -= 1;
    await blog.save();
    
    res.status(200).json({ message: 'Like removed', likes: blog.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}