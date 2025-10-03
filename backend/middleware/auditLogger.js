const AuditLog = require('../models/AuditLog');

const auditLogger = (action, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log the action asynchronously without blocking response
      setTimeout(async () => {
        try {
          const logData = {
            action,
            userId: req.voter?._id,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            details: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              duration,
              ...options.details
            },
            status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
            resource: options.resource
          };

          await AuditLog.logAction(logData);
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }, 0);

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;