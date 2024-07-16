import cluster from 'cluster';
import os from 'os';
import app from './app.js';

const numCPUs = os.cpus().length;

if(cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for(let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        }
    );
}


