import express from 'express'
import StatsController from '../controllers/statsController.js'

// ## Router:
const statsRouter = express.Router()

// ## Rutas:
statsRouter.get('/', StatsController.getStats)

// ## Exportación:
export default statsRouter
