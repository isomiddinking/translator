// Sahifa yuklanganda inputga fokus beriladi
window.onload = function() {
    document.getElementById("inputWord").focus();
    // Ovozlarni yuklash uchun bir marta ishga tushirish
    window.speechSynthesis.getVoices();
};

const input = document.getElementById("inputWord");
const resultDiv = document.getElementById("result");
const translateBtn = document.getElementById("translateBtn");
const micBtn = document.getElementById("micBtn");
const speakBtn = document.getElementById("speakBtn");

translateBtn.addEventListener("click", translateWord);
micBtn.addEventListener("click", startSpeechRecognition);
speakBtn.addEventListener("click", speakTranslation);

// 🔁 Tarjima qilish
async function translateWord() {
    const word = input.value.trim();
    if (!word) {
        resultDiv.textContent = "So'z kiriting yoki ayting!";
        return;
    }

    resultDiv.textContent = "Tarjima qilinmoqda...";

    const direction = document.querySelector('input[name="direction"]:checked').value;
    const [fromLang, toLang] = direction.split("-");

    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(word)}`);
        const data = await res.json();
        const translation = data[0][0][0];
        resultDiv.textContent = `"${word}" ➜ "${translation}"`;

        input.value = "";
        input.focus();
    } catch (error) {
        resultDiv.textContent = "Xatolik yuz berdi.";
    }
}

// 🎤 Mikrofon orqali kiritish
function startSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Brauzeringiz mikrofonni qo'llab-quvvatlamaydi");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "uz-UZ";
    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
    };

    recognition.onerror = function() {
        alert("So'z taniqlikda xatolik yuz berdi.");
    };
}

// 🔊 Ayol ovozida o'qish
function speakTranslation() {
    const direction = document.querySelector('input[name="direction"]:checked').value;
    const [fromLang, toLang] = direction.split("-");
    
    // Natijadan matnni olish
    const resultText = resultDiv.textContent;
    if (!resultText.includes("➜")) return;
    
    const translation = resultText.split("➜")[1].trim().replace(/"/g, "");
    if (!translation) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(translation);
    
    // Til sozlamalari
    utterance.lang = toLang === "en" ? "en-US" : "uz-UZ";
    utterance.rate = 0.2;  // Tezlik
    utterance.pitch = 0.5; // Balandlik

    // Ovozlarni olish
    function speakWithVoice() {
        const voices = synth.getVoices();
        
        // Ayol ovozini qidirish
        let femaleVoice = null;
        
        // Avvalo, tilga mos ovozlarni filter qilish
        const langVoices = voices.filter(voice => {
            return toLang === "en" 
                ? voice.lang.startsWith("en") 
                : voice.lang.startsWith("uz") || voice.lang.startsWith("ru");
        });
        
        // Ayol ovozini qidirish
        femaleVoice = langVoices.find(voice => {
            return voice.name.toLowerCase().includes("female") || 
                   voice.gender === "female" || 
                   voice.name.match(/samantha|zira|kendra|joanna|natalia|anna|tatyana/i);
        });
        
        // Agar ayol ovoz topilmasa, birinchi mavjud ovoz
        utterance.voice = femaleVoice || langVoices[0] || null;
        
        synth.speak(utterance);
    }

    // Ovozlar yuklanganligiga ishonch hosil qilish
    if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = speakWithVoice;
    } else {
        speakWithVoice();
    }
}

// Ovozlar o'zgarganda yangilash
window.speechSynthesis.onvoiceschanged = function() {
    window.speechSynthesis.getVoices();
};