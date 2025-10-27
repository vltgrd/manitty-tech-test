import { app } from './app'

const PORT = 5555

// Start the server
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  .on('error', (err: Error) => {
    throw new Error(err.message)
  })