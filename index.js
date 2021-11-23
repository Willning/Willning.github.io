        const QrScanner = require('qr-scanner');
        QrScanner.WORKER_PATH = './qr-scanner-worker.min.js';

        var base32 = require('hi-base32');
        const cose = require('cose-js');
        const jwk = require('./keys.json');
        const cbor = require('cbor');

        const trusted_issuers = [
            "did:web:nzcp.identity.health.nz"
          ];
          

        function scan() {
            detectWebcam((hasWebcam)=> {
                if (!hasWebcam) {
                    alert('No valid camera found');
                }
            });

            var videoElem = document.getElementById('video-pane');

            const qrScanner = new QrScanner(videoElem, async(result) => await handleScan());
            qrScanner.start();
        }

        function loadImage(){

            let image = new Image();
            image.src = 'nzcp.png';

            QrScanner.scanImage(image)
            .then(result => handleScan(result))
            .catch(error => console.log(error || 'No QR code found.'));
        }

        function detectWebcam(callback) {
            let md = navigator.mediaDevices;
                if (!md || !md.enumerateDevices) return callback(false);
                md.enumerateDevices().then(devices => {
                    callback(devices.some(device => 'videoinput' === device.kind));
                })
            }        

        async function handleScan(result) {
            console.log('Decoded qr code:', result);
            let splitPayload = result.split('/');
            console.log(splitPayload);

            //Magic to MOH happens here.
            if (!result.startsWith('NZCP:/')) {
                alert('Bad QR Code');
                throw 'Bad QR code';
            }

            //Check version
            if (splitPayload[1] && splitPayload[1] < 1) {

                alert('Incorrect version')
                throw 'Incorrect version';
            };
            
            if (splitPayload[2]) {
                let payload = splitPayload[2];

                //Pad the payload
                while((payload.length % 8 )!==0) {
                    payload+='='
                }
                console.log(payload);

                var COSEMessage = Buffer.from(base32.decode.asBytes(payload));
                
                try {                      
                    let verificationMethod = jwk.verificationMethod[0];

                    let webKey = verificationMethod.publicKeyJwk;

                    webKey.x = Buffer.from(webKey.x,'base64');
                    webKey.y = Buffer.from(webKey.y,'base64');

                    //console.log(webKey);

                    const verifiedBuffer = await cose.sign.verify(COSEMessage, {key: webKey});
                    
                    const tokenMap = await cbor.decodeFirst(verifiedBuffer);
                    
                    const now = Date.now();

                    //tokenmap details

                    //1 is iss (issuer)
                    //5 is nbf ()
                    //4 is exp (expiry)
                    
                    if (!trusted_issuers.includes(tokenMap.get(1)) ) {
                        alert("INVALID, invalid issuer ")
                        return { error: "Invalid Issuer"};
                    }

                    if (tokenMap.get(5) * 1000 > now ) {
                        alert("INVALID, not activated yet");
                        return { error: "Not Activated"};
                    }

                    if (tokenMap.get(4) * 1000 < now ) {
                        alert("INVALID, expired");
                        return { error: "Expired"};
                    }

                    alert("VALID certificate");
                    return tokenMap;
                    
                } catch (e) {
                    alert("INVALID");
                    console.error(e);
                }

            }
        }

        window.addEventListener('load', (event) => {
            scan();
            //loadImage();
        });
