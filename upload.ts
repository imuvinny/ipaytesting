import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from './supabaseClient';

interface UploadInput {
    fileBlobOrBase64: Blob | string;
    userId: string;
    filename?: string;
    isBase64?: boolean;
}

export async function uploadAvatar({ fileBlobOrBase64, userId, filename = 'upload.png', isBase64 = false }: UploadInput) {
    const BUCKET = 'avatars';
    const TTL_SIGNED_URL = 60 * 60; // seconds

    if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLIC_KEY environment variables.');
    }

    // Build unique path
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 9);
    const ext = filename.split('.').pop() || 'png';
    const path = `${BUCKET}/${userId}/${ts}_${rand}.${ext}`;

    // Convert base64 to Blob if needed
    function base64ToBlob(base64: string, mimeType: string) {
        const cleaned = base64.startsWith('data:') ? base64.split(',')[1] : base64;
        const byteChars = atob(cleaned);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    let blob: Blob;
    if (isBase64 && typeof fileBlobOrBase64 === 'string') {
        blob = base64ToBlob(fileBlobOrBase64, `image/${ext}`);
    } else if (fileBlobOrBase64 instanceof Blob) {
        blob = fileBlobOrBase64;
    } else {
        // Fallback: try to detect if string is base64 even if flag is false, or just error
        if (typeof fileBlobOrBase64 === 'string') {
             blob = base64ToBlob(fileBlobOrBase64, `image/${ext}`);
        } else {
             throw new Error('Invalid file input');
        }
    }

    // Helper: upload via Storage object endpoint
    async function uploadFile(path: string, fileBlob: Blob) {
        const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(path)}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
                'x-upsert': 'false',
            },
            body: fileBlob
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${text}`);
        }
        return true;
    }

    // 1) Upload to storage
    await uploadFile(path, blob);

    // 2) Get URL
    let publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(path)}`;
    let finalUrl = null;

    try {
        const head = await fetch(publicUrl, { method: 'HEAD' });
        if (head.ok) {
            finalUrl = publicUrl;
        } else {
            // Private bucket — create signed url
            const signRes = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(path)}?expires=${TTL_SIGNED_URL}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiresIn: TTL_SIGNED_URL })
            });

            if (!signRes.ok) {
                const txt = await signRes.text();
                throw new Error(`Create signed URL failed: ${signRes.status} ${signRes.statusText} - ${txt}`);
            }
            const signJson = await signRes.json();
            finalUrl = signJson.signedURL || signJson.signed_url || null;
        }
    } catch (err: any) {
        throw new Error(`Error determining file URL: ${err.message}`);
    }

    if (!finalUrl) throw new Error('Failed to obtain a file URL.');

    // 3) Persist path in profiles table via PostgREST
    const profilesUrl = `${SUPABASE_URL}/rest/v1/profiles`;
    const payload = {
        id: userId,
        avatar_url: path,
        updated_at: new Date().toISOString()
    };

    const dbRes = await fetch(`${profilesUrl}?on_conflict=id`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
            apikey: SUPABASE_PUBLIC_KEY
        },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const txt = await dbRes.text();
        // Optional: attempt to remove the uploaded file
        await fetch(`${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(path)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}` }
        }).catch(() => { });
        throw new Error(`DB upsert failed: ${dbRes.status} ${dbRes.statusText} - ${txt}`);
    }

    return {
        path,
        url: finalUrl
    };
}
