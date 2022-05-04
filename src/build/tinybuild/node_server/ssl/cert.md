From: https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/

To generate a self-signed certificate, run the following in your shell:
```
    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem
```

Need cert.pem and key.pem in the ssl folder or at a path specified in server/server_settings.js