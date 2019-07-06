const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const { processes, newProcess } = require('./docker-processes');
const createDockerComposeArgs = require('./create-docker-compose-args');

const app = express();
const port = process.env.SERVER_PORT || 9697;

expressWs(app);
app.use(express.json());
app.use(cors());

app.post('/docker-compose/exec', ({ body: { workingDirectory, file, parameters } }, res) => {
  const itOpt = process.platform === 'win32' ? ['-T'] : [];
  const args = createDockerComposeArgs('exec', file, itOpt.concat(parameters));
  const number = newProcess('docker-compose.exe', args, workingDirectory);
  res.send({ number });
});

app.post('/docker-compose/up', ({ body: { workingDirectory, file } }, res) => {
  const args = createDockerComposeArgs('up', file);
  const number = newProcess('docker-compose.exe', args, workingDirectory);
  res.send({ number });
});

app.post('/docker-compose/down', ({ body: { workingDirectory, file } }, res) => {
  const args = createDockerComposeArgs('down', file);
  const number = newProcess('docker-compose.exe', args, workingDirectory);
  res.send({ number });
});

app.ws('/', (ws) => {
  ws.on('message', (paramsMsg) => {
    const { number, stdtype } = JSON.parse(paramsMsg);
    if (processes[number] === undefined) {
      return;
    }
    const intervalId = setInterval(() => {
      if (ws.readyState === 3) {
        clearInterval(intervalId);
        return;
      }
      if (processes[number][stdtype].length > 0 && ws.readyState === 1) {
        ws.send(JSON.stringify({
          number,
          stdtype,
          data: processes[number][stdtype],
        }));
        processes[number][stdtype] = '';
      }
    }, 16);
  });
});


app.listen(port, () => {});
