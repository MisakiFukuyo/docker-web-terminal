
module.exports = function createDockerComposeArgs(command, file, otherArgs = []) {
  let args = [];
  if (file) {
    args = args.concat(['-f', file]);
  }
  return args.concat([command]).concat(otherArgs);
};
