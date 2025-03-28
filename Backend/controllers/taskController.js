import { Bin } from "../modals/binModal.js";
import { Todo } from "../modals/taskModal.js";
import ErrorHandler from "../utils/error.js";

// Function to Add New Task or Todo..

export const addTask = async (req, res, next) => {
  try {
    const { title, description,date } = req.body;

    if (!title || !description || !date)
      return next(new ErrorHandler("All fields are required.", 404));

      const dueDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0);

      if (dueDate < today)  return next(new ErrorHandler("Selected date cannot be in the past.", 404));
  

    const todo = await Todo.create({
      title,
      description,
      dueDate,
      user: req.user._id,
    });

    res.status(201).json({
      sucess: true,
      message: "task Created successfully!",
      todo: todo._id
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Fuction for To Get my All task or Todo..

export const getMyTask = async (req, res, next) => {
  try {
    const { id } = req.user;

    const tasks = await Todo.find({ user: id });


    res.status(200).json({
      message: "Your Task!",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Function To marks My Task or Todo..

export const markTask = async (req, res, next) => {
  const {value} = req.body

  const { id } = req.params;

  try {
  

    const task = await Todo.findById(id);

    if (!task) return next(new ErrorHandler("Invalid Id!", 404));

    task.iscompleted = value;

    await task.save();

    res.status(200).json({
      sucess: true,
      message: "Task Updated successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Function To Update My Task or Todo..

export const updateTask = async (req, res, next) => {
  
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    if (!title || !description)
      return next(new ErrorHandler("All fields are required.", 404));
    const task = await Todo.findById(id);

    if (!task) return next(new ErrorHandler("Invalid Id!", 404));

    task.title = title;
    task.description = description;

    await task.save();

    res.status(200).json({
      sucess: true,
      message: "Task Updated successfully!",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Function To Delete My Task or Todo..

export const deleteTask = async (req, res, next) => {

  const { id } = req.params;

  try {

    const task = await Bin.findById(id);

    if (!task) return next(new ErrorHandler("Invalid Id!", 404));

    await task.deleteOne();

    res.status(200).json({
      sucess: true,
      message: "Task Deleted successfully!.",
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};


// Function To Delete All Task or Todo..

export const deleteAllTask = async (req, res, next) => {
  try {
    await Bin.deleteMany();

    res.status(200).json({
      sucess: true,
      message: "Deleted successfully!.",
    });
  } catch (error) {
    next(error);
  }
};

// Function To Push My Task or Todo to Bin..

export const pushToBin = async (req, res, next) => {

  const { id } = req.params;

  try {

    const todo = await Todo.findById(id);

    if (!todo) return next(new ErrorHandler("Invalid Id!", 404));

    await Bin.create({
      ...todo._doc,
      user: todo.user,   
    });

   await todo.deleteOne();

    res.status(201).json({
      sucess: true,
      message: "Task added to Bin !",
     
    });

  
  } catch (error) {
    console.log(error);
    next(error);
  }
  
};


// Function To Fetch My Bin Task or Todo..
export const fetchBin = async (req, res, next) => {
  try {
    const { id } = req.user;

    const tasks = await Bin.find({ user: id });

    res.status(200).json({
      message: "Your Bin Tasks!",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};


// Function To Restore My Task or Todo from Bin..
export const restoreFromBin = async (req, res, next) => {

  const { id } = req.params;

  try {
   
    const task = await Bin.findById(id);

    if (!task) return next(new ErrorHandler("Invalid Id!", 404));

    await Todo.create({
      ...task._doc,
      user: task.user,   
    });

    await task.deleteOne();

    res.status(200).json({
      message: "Restored Successfully!",
      task,
    });
  } catch (error) {
    next(error);
  }
};
