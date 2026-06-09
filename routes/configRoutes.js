import express from 'express'
import ConfigController from '../controllers/configController.js'

const configRouter = express.Router()

configRouter.get('/', ConfigController.getConfig)
configRouter.patch('/', ConfigController.updateConfig)

export default configRouter
