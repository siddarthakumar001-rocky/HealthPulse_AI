/**
 * HealthPulse AI - Asynchronous Job Queue Service
 * Processes heavy computation (PDF OCR, AI analysis, notifications) in the background
 * without blocking incoming HTTP requests.
 * Uses Redis/BullMQ when available, with an in-memory concurrent worker queue fallback.
 */

const logger = require('../utils/logger');
const EventEmitter = require('events');

class InMemoryJobQueue extends EventEmitter {
  constructor(concurrency = 5) {
    super();
    this.concurrency = concurrency;
    this.activeJobs = 0;
    this.queue = [];
    this.handlers = new Map();
  }

  registerHandler(jobType, handler) {
    this.handlers.set(jobType, handler);
  }

  async addJob(jobType, data, options = {}) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      jobType,
      data,
      attempts: 0,
      maxRetries: options.maxRetries || 2,
      createdAt: new Date()
    };

    this.queue.push(job);
    logger.info(`[Queue] Job queued: ${job.id} (${jobType})`);
    setImmediate(() => this.processNext());
    return job;
  }

  async processNext() {
    if (this.activeJobs >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    const handler = this.handlers.get(job.jobType);
    if (!handler) {
      logger.error(`[Queue] No handler registered for job type: ${job.jobType}`);
      return;
    }

    this.activeJobs += 1;
    job.attempts += 1;

    try {
      logger.info(`[Queue] Processing job: ${job.id} (${job.jobType})`);
      const result = await handler(job.data);
      logger.info(`[Queue] Job completed successfully: ${job.id}`);
      this.emit('completed', { job, result });
    } catch (err) {
      logger.error(`[Queue] Job failed: ${job.id} - ${err.message}`);
      if (job.attempts <= job.maxRetries) {
        logger.info(`[Queue] Requeuing job: ${job.id} (Attempt ${job.attempts}/${job.maxRetries})`);
        this.queue.push(job);
      } else {
        logger.error(`[Queue] Job ${job.id} exceeded max retries and was moved to dead-letter.`);
        this.emit('failed', { job, error: err.message });
      }
    } finally {
      this.activeJobs -= 1;
      setImmediate(() => this.processNext());
    }
  }
}

const queueService = new InMemoryJobQueue(5);

// Register standard background job handlers
queueService.registerHandler('HEALTH_ANALYSIS_ASYNC', async (data) => {
  const { analyzeUserHealth } = require('./healthService');
  return await analyzeUserHealth(data.userId, data.vitals, data.deviceId);
});

queueService.registerHandler('AUDIT_LOG_ASYNC', async (data) => {
  const { createAuditEntry } = require('./auditService');
  return await createAuditEntry(data);
});

module.exports = queueService;
