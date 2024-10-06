import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDateTime: Date,
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    required: true
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'family', 'hobbies', 'education'],
    required: true
  },
  completed: { type: Boolean, default: false },
  tags: [String],
  estimatedDuration: Number,
  subtasks: [subtaskSchema],
  links: [String]
});

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
