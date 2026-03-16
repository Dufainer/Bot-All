import winston from 'winston'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logsDir = path.join(__dirname, '../../logs')

const { combine, colorize, timestamp, printf } = winston.format

const consoleFmt = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ timestamp: ts, level, message, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `[${ts}] ${level}: ${message}${extra}`
  })
)

const fileFmt = combine(
  timestamp(),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  transports: [
    new winston.transports.Console({ format: consoleFmt }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFmt
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFmt
    })
  ]
})

export default logger
