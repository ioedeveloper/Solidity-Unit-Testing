import * as core from '@actions/core'
import * as cli from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'

async function execute () {
  const testPath = core.getInput('test-path')
  const compilerVersion = core.getInput('compiler-version')
  console.log('compiler-version: ', compilerVersion)
  const workingDirectory = process.cwd()

  await cli.exec('ls')

  await core.group("Install @remix-project/remix-tests cli", async () => {
    const yarnLock = path.join(workingDirectory, 'yarn.lock')
    const isYarnRepo = fs.existsSync(yarnLock)
    const packageLock = path.join(workingDirectory, 'package-lock.json')
    const isNPMrepo = fs.existsSync(packageLock)

    if (isYarnRepo) {
      await cli.exec('yarn', ['global', 'add', '@remix-project/remix-tests'])
    } else if (isNPMrepo) {
      await cli.exec('npm', ['install', '@remix-project/remix-tests', '-g'])
    } else {
      await cli.exec('npm', ['init', '-y'])
      await cli.exec('npm', ['install', '@remix-project/remix-tests', '-g'])
    }
  })


  await core.group("Run tests", async () => {
    cli.exec('remix-tests', ['--compiler', compilerVersion, testPath]).catch((error) => {
      core.setFailed(error)
    })
  })
}

execute().catch(error => {
  if (typeof (error) !== 'string') {
    if (error.message) error = error.message
    else {
      try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
    }
  }
  core.setFailed(error)
})