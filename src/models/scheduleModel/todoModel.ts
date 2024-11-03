import mongoose from 'mongoose';

export interface ITodo {
  _id: string;
  userId: string;
  dueDateTime: string | number | Date;
  title: string;
  description: string;
  priority: string;
  category: string;
  tags: string[];
  estimatedDuration: number;
  completed: boolean;
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  links: string[];
  createdAt: string;
  updatedAt: string;
}

const subtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const todoSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Removed unique: true
  title: { type: String, required: true },
  description: String,
  dueDateTime: Date,
  priority: {
    type: String,
    enum: ["lowest", "low", "medium", "high", "highest"],
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'family', 'hobbies', 'education', 'others'],
    required: true
  },
  completed: { type: Boolean, default: false },
  tags: [String],
  estimatedDuration: Number,
  subtasks: [subtaskSchema],
  links: [String]
}, { timestamps: true }); // Added timestamps

todoSchema.pre('save', function(next) {
  if (this.subtasks && this.subtasks.length > 0) {
    this.completed = this.subtasks.every(subtask => subtask.completed);
  } else {
    this.completed = false;
  }
  next();
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
export default Todo;