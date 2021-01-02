import app from './app';

const PORT = app.get('port');
app.listen(PORT, () => {
    console.log(`HTTP server listening at port ${PORT}`)
})
