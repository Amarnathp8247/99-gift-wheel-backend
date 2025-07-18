// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    return res.status(statusCode).json({
      status: false,
      message,
      data: null,
      messageCode: err.messageCode || 'SERVER_ERROR',
    });
  };
  
  export default errorHandler;
  