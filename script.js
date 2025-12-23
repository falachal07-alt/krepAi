const apiKey = "AIzaSyB1_w6KXwyuaKSWPL3hAvpwxqj2hdTbpeQ"; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const processBtn = document.getElementById('processBtn');
const styleSelect = document.getElementById('styleSelect');
const charCount = document.getElementById('charCount');
const msgBox = document.getElementById('msgBox');
const copyBtn = document.getElementById('copyBtn');

inputText.addEventListener('input', () => {
    charCount.innerText = `${inputText.value.length} Karakter`;
});

copyBtn.addEventListener('click', () => {
    const text = outputText.innerText;
    if (!text) return;
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showStatus("Teks berhasil disalin!", "#10b981");
});

function showStatus(msg, color) {
    msgBox.innerText = msg;
    msgBox.style.color = color;
}

async function startParaphrase() {
    const text = inputText.value.trim();
    const style = styleSelect.value;

    if (!text || text.length < 5) {
        showStatus("Teks terlalu pendek.", "orange");
        return;
    }

    processBtn.disabled = true;
    processBtn.innerText = "Mengkrep...";
    showStatus("Sedang memproses...", "#6366f1");
    outputText.innerText = "";

    const payload = {
        contents: [{
            parts: [{
                text: `Anda adalah pakar penulisan ulang manusiawi (Humanizer). 
                Parafrase teks ini dengan gaya ${style} agar memiliki alur yang dinamis (burstiness) 
                dan pilihan kata yang tidak kaku (perplexity). 
                Tujuannya agar tidak terdeteksi sebagai AI. Hasil langsung tanpa penjelasan: "${text}"`
            }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error?.status === "PERMISSION_DENIED" || data.error?.message.includes("API has not been used")) {
                throw new Error("API belum aktif. Silakan buka Google AI Studio lagi dan pastikan project Anda sudah mengaktifkan 'Generative Language API'.");
            }
            throw new Error(data.error?.message || "Terjadi kesalahan API.");
        }

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (result) {
            outputText.innerText = result.trim();
            showStatus("Selesai! Teks kini lebih manusiawi.", "green");
        } else {
            throw new Error("Respon kosong dari AI.");
        }

    } catch (err) {
        console.error("DEBUG:", err);
        showStatus("Gagal: " + err.message, "red");
        outputText.innerText = "Klik 'Mulai Proses' lagi jika Anda baru saja mengaktifkan API.";
    } finally {
        processBtn.disabled = false;
        processBtn.innerText = "Mulai Proses";
    }
}

processBtn.addEventListener('click', startParaphrase);