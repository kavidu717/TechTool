import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('auth:login', async (event, credentials) => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/login', credentials)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed from server' }
  }
})

ipcMain.handle('auth:register', async (event, data) => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/register', data)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed from server' }
  }
})

ipcMain.handle('products:getAll', async (event, token) => {
  try {
    const response = await axios.get('http://localhost:5000/api/products', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.log(error.message, error.response?.status)
    return {
      success: false,

      message: error.response?.data?.message || 'failed to fetch products'
    }
  }
})

// Fetch all suppliers
ipcMain.handle('suppliers:getAll', async (event, token) => {
  try {
    const response = await axios.get('http://localhost:5000/api/suppliers', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.log('SUPPLIER FETCH ERROR:', error.message)
    return { success: false, message: 'Failed to fetch suppliers' }
  }
})

// add the new supplier
ipcMain.handle('suppliers:add', async (event, data, token) => {
  try {
    const response = await axios.post('http://localhost:5000/api/suppliers/add', data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.log('SUPPLIER ADD ERROR:', error.message)
    return { success: false, message: 'Failed to add supplier' }
  }
})

// add new products
ipcMain.handle('products:add', async (event, data, token) => {
  try {
    const response = await axios.post('http://localhost:5000/api/products/add', data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.log('PRODUCT ADD ERROR:', error.message)
    return { success: false, message: 'Failed to add product' }
  }
})

// fetch all purchases
ipcMain.handle('get-purchases', async (event, token) => {
  try {
    const response = await axios.get('http://localhost:5000/api/purchases', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.log('PURCHASES FETCH ERROR:', error.message)
    return { success: false, message: 'Failed to fetch purchases' }
  }
})

// GRN
ipcMain.handle('add-purchase', async (event, data, token) => {
  try {
    // Generate a reference number if one is not provided by the frontend
    if (!data.reference_no) {
      data.reference_no = `GRN-${Date.now()}`
    }

    const response = await axios.post('http://localhost:5000/api/purchases/add', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      success: true,
      message: response.data.message
    }
  } catch (error) {
    console.error('Error adding purchase:', error?.response?.data || error.message)

    return {
      success: false,
      message: error?.response?.data?.error || 'Failed to save GRN.'
    }
  }
})

// add new sale
ipcMain.handle('add-sale', async (event, saleData, token) => {
  try {
    const response = await axios.post('http://localhost:5000/api/sales/add', saleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return { success: true, message: response.data.message }
  } catch (error) {
    console.error('Error adding sale:', error?.response?.data || error.message)
    return {
      success: false,
      message: error?.response?.data?.error || 'Failed to save sale.'
    }
  }
})

//get all sale
ipcMain.handle('get-sales', async (event, token) => {
  try {
    const response = await axios.get('http://localhost:5000/api/sales', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, message: 'Failed to fetch sales', error }
  }
})

// report handlers
ipcMain.handle('get-reports', async (event, params, token) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/reports`, {
      params: params,
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, message: 'Failed to fetch reports', error }
  }
})

ipcMain.handle('get-dashboard-stats', async (event, token, date) => {
  try {
    // Append the filter as a query parameter in the URL
    const url = `http://localhost:5000/api/dashboard?date=${date}`
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
