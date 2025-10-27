import { app } from './app.js'
import * as fs from 'fs'

const PORT = 5555

// Load json data
function loadJsonData(path: string) {
  const data = fs.readFileSync(path, 'utf-8')
  return JSON.parse(data)
}

try {
  const jsonData = loadJsonData('./public/data.json')
  console.log('JSON data loaded successfully')
} catch (error) {
  console.error('Error loading JSON data:', error)
}

// Start the server
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  .on('error', (err: Error) => {
    throw new Error(err.message)
  })
