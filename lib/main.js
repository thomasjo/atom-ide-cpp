const { spawn } = require('child_process')
const { AutoLanguageClient } = require('atom-languageclient')

class CppLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ 'source.c', 'source.cpp' ] }
  getLanguageName () { return 'C++' }
  getServerName () { return 'Clangd' }

  startServerProcess (projectPath) {
    const command = atom.config.get('ide-cpp.clangdPath')
    const args = []
    const options = {}

    this.logger.debug(`Starting ${command} ${args.join(' ')}`)
    const serverProcess = spawn(command, args, options)

    serverProcess.on('error', error => {
      if (error.code === 'ENOENT') {
        atom.notifications.addError(`Unable to start ${this.getServerName()} language server`, {
          dismissable: true,
          description: '' +
            `Tried to spawn process using executable **${error.path}**, which does not exist. ` +
            `Ensure you have correctly configured the path to Clangd in the package settings.`
        })
      }
    })

    return Promise.resolve(serverProcess)
  }
}

module.exports = new CppLanguageClient()
