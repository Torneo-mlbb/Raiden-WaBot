import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    command: ['reveal', 'vv', 'ver', 'antiviewonce'],
    category: 'tools',
    run: async (ctx: any) => {
        const { sock, m, chat } = ctx;

        // 1. Obtener el mensaje citado desde cualquier estructura posible
        const quoted = m.quoted || m.msg?.contextInfo?.quotedMessage;
        if (!quoted) {
            return m.reply('❌ Responde (cita) a una foto, video o audio de "ver una sola vez" para revelarlo.');
        }

        try {
            // 2. Desenvolver todas las variantes de contenedores ViewOnce de WhatsApp
            let rawMsg = quoted.message || quoted;
            if (rawMsg.viewOnceMessageV2) {
                rawMsg = rawMsg.viewOnceMessageV2.message;
            } else if (rawMsg.viewOnceMessageV2Extension) {
                rawMsg = rawMsg.viewOnceMessageV2Extension.message;
            } else if (rawMsg.viewOnceMessage) {
                rawMsg = rawMsg.viewOnceMessage.message;
            }

            // 3. Identificar el tipo de archivo exacto
            const imageMsg = rawMsg?.imageMessage;
            const videoMsg = rawMsg?.videoMessage;
            const audioMsg = rawMsg?.audioMessage;

            const mediaContent = imageMsg || videoMsg || audioMsg;
            if (!mediaContent) {
                return m.reply('❌ El mensaje citado no contiene una foto, video o nota de voz válida.');
            }

            const mediaType = imageMsg ? 'image' : videoMsg ? 'video' : 'audio';

            // 4. Descargar el buffer directamente desde los servidores de WhatsApp
            let buffer = Buffer.from([]);
            if (typeof quoted.download === 'function') {
                buffer = await quoted.download();
            } else {
                const stream = await downloadContentFromMessage(mediaContent, mediaType);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
            }

            if (!buffer || buffer.length === 0) {
                return m.reply('❌ No se pudo descargar el archivo (puede que haya expirado o ya fue borrado).');
            }

            const caption = mediaContent.caption || '👀 *Archivo revelado*';

            // 5. Reenviar según el tipo de multimedia
            if (mediaType === 'image') {
                await sock.sendMessage(chat, { image: buffer, caption }, { quoted: m });
            } else if (mediaType === 'video') {
                await sock.sendMessage(chat, { video: buffer, caption }, { quoted: m });
            } else if (mediaType === 'audio') {
                await sock.sendMessage(chat, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
            }

        } catch (e) {
            console.error('[REVEAL ERROR]:', e);
            m.reply('❌ Error al procesar el archivo. Asegúrate de responder directamente al mensaje de ver una sola vez.');
        }
    }
};
