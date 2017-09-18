const { spawn } = require('child_process')
const { AutoLanguageClient } = require('atom-languageclient')

class CppLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ 'source.c', 'source.cpp' ] }
  getLanguageName () { return 'C++' }
  getServerName () { return 'Clangd' }

  startServerProcess (projectPath) {
    const command = '/usr/bin/clangd'
    const args = []
    const options = {}

    this.logger.debug(`Starting ${command} ${args.join(' ')}`)
    const serverProcess = spawn(command, args, options)

    serverProcess.on('error', error => {
      console.log(error)
      atom.notifications.addError(`Unable to start ${this.getServerName()} language server`, {
        description: '',
        dismissable: true
      })
    })

    return Promise.resolve(serverProcess)
  }
}

module.exports = new CppLanguageClient()
