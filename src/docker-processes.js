const { spawn } = require('child_process');

const processes = [];

function newProcess(program, args, workingDirectory) {
  processes.push({
    childProcess: spawn(program, args,
      { cwd: workingDirectory, shell: process.platform === 'win32', env: process.env }),
    stdout: '',
    stderr: '',
  });
  const number = processes.length - 1;
  processes[number].childProcess.stdout.on('data', (data) => {
    processes[number].stdout += data.toString();
  });
  processes[number].childProcess.stderr.on('data', (data) => {
    processes[number].stderr += data.toString();
  });
  return number;
}

module.exports = {
  processes,
  newProcess,
};
