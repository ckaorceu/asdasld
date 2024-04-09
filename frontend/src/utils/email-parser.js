import PostalMime from 'postal-mime';
import { parse_message } from 'mail-parser-wasm'

export async function processItem(item) {
    // Try to parse the email using mail-parser-wasm
    try {
        const parsedEmail = parse_message(item.raw);
        item.source = parsedEmail.sender || item.source;
        item.subject = parsedEmail.subject || '';
        item.message = parsedEmail.body_html || parsedEmail.text || '';
        item.attachments = parsedEmail.attachments?.map((a_item) => {
            const blob_url = URL.createObjectURL(
                new Blob(
                    [a_item.content],
                    { type: a_item.content_type || 'application/octet-stream' }
                ))
            if (a_item.content_id && a_item.content_id.length > 0) {
                item.message = item.message.replace(`cid:${a_item.content_id}`, blob_url);
            }
            return {
                id: a_item.content_id || Math.random().toString(36).substring(2, 15),
                filename: a_item.filename || a_item.content_id || "",
                size: a_item.content?.length || 0,
                url: blob_url
            }
        }) || [];
    } catch (error) {
        console.log('Error parsing email with mail-parser-wasm');
        console.error(error);
    }
    if (item.subject && item.subject.length > 0 && item.message && item.message.length > 0) {
        return item;
    }
    // Fallback to PostalMime
    try {
        const parsedEmail = await PostalMime.parse(item.raw);
        item.source = parsedEmail.from.address || item.source;
        item.subject = parsedEmail.subject || 'No Subject';
        item.message = parsedEmail.html || parsedEmail.text || item.raw;
        item.attachments = parsedEmail.attachments?.map((a_item) => {
            const blob_url = URL.createObjectURL(
                new Blob(
                    [a_item.content],
                    { type: a_item.mimeType || 'application/octet-stream' }
                ))
            if (a_item.contentId && a_item.contentId.length > 0) {
                item.message = item.message.replace(`cid:${a_item.contentId}`, blob_url);
            }
            return {
                id: a_item.contentId || Math.random().toString(36).substring(2, 15),
                filename: a_item.filename || a_item.contentId || "",
                size: a_item.content?.length || 0,
                url: blob_url
            }
        }) || [];
    } catch (error) {
        console.log('Error parsing email with PostalMime');
        console.error(error);
        item.subject = 'No Subject';
        item.message = item.raw;
    }
}

export function getDownloadEmlUrl(raw) {
    return URL.createObjectURL(
        new Blob([raw], { type: 'text/plain' }
        ))
}
