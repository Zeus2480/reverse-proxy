const express = require('express');
const httpProxy = require('http-proxy');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const PORT = 8000;
const BASE_PATH = `https://vercel-clone-2480.s3.ap-south-1.amazonaws.com/__outputs/`

const proxy = httpProxy.createProxy()
app.use(async (req, res) => {
    try {
        const hostName = req.hostname;
        const subDomain = hostName.split('.')[0];
        const project = await prisma.project.findFirst({
            where: { subDomain: subDomain }
        });
        const resolveTo = `${BASE_PATH}/${project.id}`;
        return proxy.web(req, res, { target: resolveTo, changeOrigin: true });

    } catch (err) {
        console.log(err);
        return res.status(404).send('Not Found');
    }
})
proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/') {
        proxyReq.path += 'index.html'
    }
    // console.log(proxyReq)
    return proxyReq
})

app.listen(PORT, () => console.log("Reverse Proxy is running on port 8000"));