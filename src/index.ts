import { createConnection } from 'typeorm';
import app from './app';

const PORT = app.get('port');

createConnection()
    .then(_ => {
        app.listen(PORT, () => {
            console.log(`HTTP server listening at port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Server terminated with error:', err);
    });
