const { spawn } = require('child_process')
const { AutoLanguageClient } = require('atom-languageclient')

class CppLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ 'source.c', 'source.cpp' ] }
  getLanguageName () { return 'C++' }
  getServerName () { return 'Clangd' }

  startServerProcess (projectPath) {
    const command = atom.config.get('ide-cpp.clangdPath')
    const args = [ '-run-synchronously' ]
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

    serverProcess.stdout.on('data', data => {
      console.log("stdout: \n", data.toString())
    })

    serverProcess.stderr.on('data', data => {
      console.log("stderr: \n", data.toString())
    })

    serverProcess.on('exit', (code, signal) => {
      if (code) {
        this.logger.debug(`Server process exited with code ${code}`)
      } else if (signal) {
        this.logger.debug(`Server process received ${signal} signal`)
      } else {
        this.logger.debug('Server process killed')
      }
    })

    return Promise.resolve(serverProcess)
  }

  appendClangMetadata (params) {
    params.metadata = {
      extraFlags: [
        "-std=c++11",
        "-I/home/thomasjo/Code/node/cmark/src",
        "-I/home/thomasjo/Code/node/cmark/node_modules/nan",
        "-I/home/thomasjo/Code/node/cmark/vendor/cmark/src",
        "-I/home/thomasjo/Code/node/cmark/vendor/cmark/build/src",
        "-I/home/thomasjo/.nodenv/versions/8.5.0/include/node/"
      ]
    }

    return params
  }

  preInitialization (connection) {
    const shutdown = connection.shutdown.bind(connection)
    connection.shutdown = () => {
      try {
        shutdown()
      }
      catch (error) {
        console.error(error)
      }
      return Promise.resolve()
    }

    const didOpenTextDocument = connection.didOpenTextDocument.bind(connection)
    connection.didOpenTextDocument = (params) => {
      params = this.appendClangMetadata(params)
      didOpenTextDocument(params)
    }

    const completion = connection.completion.bind(connection)
    connection.completion = async (params) => {
      console.log(params)
      const response = await completion(params)
      console.log(response)
      return Promise.resolve(response)
    }
  }
}

module.exports = new CppLanguageClient()
