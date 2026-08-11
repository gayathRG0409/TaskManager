/**
 * Compatibility re-exports for the storage layer.
 * Prefer importing from `./store/index.js` in new code.
 */
export {
  createTask,
  createUser,
  deleteTask,
  findUserByEmail,
  findUserById,
  getTask,
  listTasks,
  moveTask,
  nextPosition,
  publicTask,
  publicUser,
  sortByPosition,
  storageDriver,
  store,
  taskStats,
  updateTask,
  updateUser,
} from './store/index.js'
