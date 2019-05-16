import AWSS3Multipart from "@uppy/aws-s3-multipart";
const emitSocketProgress = require('@uppy/utils/lib/emitSocketProgress')
const getSocketHost = require('@uppy/utils/lib/getSocketHost')
const { Socket } = require('@uppy/companion-client')

/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
function createEventTracker(emitter) {
  const events = []
  return {
    on(event, fn) {
      events.push([event, fn])
      return emitter.on(event, fn)
    },
    remove() {
      events.forEach(([event, fn]) => {
        emitter.off(event, fn)
      })
    }
  }
}

export default class PatchedAWSS3Multipart extends AWSS3Multipart {
  connectToServerSocket(file) {
    return new Promise((resolve, reject) => {
      const token = file.serverToken
      const host = getSocketHost(file.remote.companionUrl)
      const socket = new Socket({ target: `${host}/api/${token}` })
      this.uploaderSockets[socket] = socket
      this.uploaderEvents[file.id] = createEventTracker(this.uppy)

      this.onFileRemove(file.id, (removed) => {
        this.resetUploaderReferences(file.id, { abort: true })
        resolve(`upload ${file.id} was removed`)
      })

      this.onFilePause(file.id, (isPaused) => {
        socket.send(isPaused ? 'pause' : 'resume', {})
      })

      this.onPauseAll(file.id, () => socket.send('pause', {}))

      this.onResumeAll(file.id, () => {
        if (file.error) {
          socket.send('pause', {})
        }
        socket.send('resume', {})
      })

      this.onRetry(file.id, () => {
        socket.send('pause', {})
        socket.send('resume', {})
      })

      this.onRetryAll(file.id, () => {
        socket.send('pause', {})
        socket.send('resume', {})
      })

      if (file.isPaused) {
        socket.send('pause', {})
      }

      socket.on('progress', (progressData) => emitSocketProgress(this, progressData, file))

      socket.on('error', (errData) => {
        this.uppy.emit('upload-error', file, new Error(errData.error))
        reject(new Error(errData.error))
      })

      socket.on('success', (data) => {
        const uploadResp = {
          uploadURL: data.url
        }

        this.uppy.emit('upload-success', file, uploadResp)
        resolve()
      })
    })
  }
}