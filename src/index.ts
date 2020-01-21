import {Tokenchannel} from "tokenchannel";
import {Channel, Charset, IChallengeOptions} from "tokenchannel/dist/model";
import * as reader from "readline-sync";
import {InvalidIdentifierError} from "tokenchannel/dist/errors/invalid-identifier";
import {InvalidCodeError} from "tokenchannel/dist/errors/invalid-code";

const apiKey = 'TCk-RiRNRU2EWpyJj3xs71nnQ04rF6CvTnfuq1fN';
const tokenchannel = new Tokenchannel(apiKey);
const options: IChallengeOptions = {
    language: 'es',
    maxAttempts: 5,
    codeLength: 6,
    expirationInMinutes: 5,
    charset: Charset.DEC
};


function getDescriptorByChannel(channel: Channel) {
    switch (channel) {
        case Channel.EMAIL:
            return 'correo-e';
        case Channel.VOICE:
        case Channel.SMS:
            return 'número de teléfono';
        case Channel.TELEGRAM:
        case Channel.PUSHOVER:
        default:
            return 'identificador';
    }
}

async function authStep() {

    const c = reader.question("Elige entre [ sms | voice | email | pushover | telegram]: ")
    const channel = <Channel>c;
    const identificador = reader.question(`Dime tu ${getDescriptorByChannel(channel)}: `);

    try {
        const {requestId} = await tokenchannel.challenge(channel, identificador, options);

        let keepGoing = true;
        do {

            const validationCode = reader.question("Confirma el código que has recibido: ");
            try {
                await tokenchannel.authenticate(requestId, validationCode);
                keepGoing = false;
                console.log("Challenge superado");
            } catch (e) {
                if (e instanceof InvalidCodeError) {
                    console.log("Código inválido. Inténtelo de nuevo.");
                } else {
                    console.log("Adios!");
                    keepGoing = false;
                }
            }
        } while (keepGoing);

    } catch (e) {
        if (e instanceof InvalidIdentifierError) {
            console.log("Identificador inválido");
        } else {
            console.log(e);
        }
    }


}

authStep().then(() => 0).catch(() => 1);
