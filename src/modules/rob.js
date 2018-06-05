// @flow

type WorkerElement = {
  from: string,
  to: string
}

class Rob {
  workers: Map<string, Array<WorkerElement>>

  constructor() {
    this.workers = new Map()
  }

  createWorker(guildId: string, authorId: string, targetId: string): void {
    const workers = this.getWorkers(guildId)
    this.workers.set(guildId, [...workers, { from: authorId, to: targetId }])
  }

  workerExists(guildId: string, authorId: string): boolean {
    if (this.workers.has(guildId)) {
      const workers = this.getWorkers(guildId)
      const exists = workers.some((worker: WorkerElement) => {
        return worker.from === authorId
      })

      if (exists) {
        return true
      }

      return false
    }

    return false
  }

  deleteWorker(guildId: string, authorId: string): void {
    const workers = this.getWorkers(guildId)
    // delete worker from guild
    const filteredWorkers = workers.filter((worker: WorkerElement) => {
      return worker.from !== authorId
    })

    this.workers.set(guildId, filteredWorkers)
  }

  getInWorker(guildId: string, authorId: string): ?WorkerElement {
    const workers = this.getWorkers(guildId)

    // no need to process if no workers in this guild
    if (!workers.length) {
      return null
    }

    // check if worker exists
    const worker = workers.find((worker: WorkerElement) => {
      return worker.from === authorId
    })

    return worker
  }

  getWorkers(guildId: string): Array<WorkerElement> {
    return this.workers.get(guildId) || []
  }
}

module.exports = Rob
