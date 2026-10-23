const path = require('path');
const moduleAlias = require('module');
const origResolveFilename = moduleAlias._resolveFilename;

moduleAlias._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const relative = request.substring(2);
    const resolvedPath = path.resolve(__dirname, '..', 'src', relative);
    return origResolveFilename.call(this, resolvedPath, parent, isMain, options);
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};

require('sucrase/register');
